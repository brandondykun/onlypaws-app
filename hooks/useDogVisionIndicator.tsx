import { useState, useRef, useCallback, useEffect } from "react";
import { Animated, Easing } from "react-native";

const DOG_VISION_INDICATOR_ENTER_DELAY_MS = 16;
const DOG_VISION_INDICATOR_ENTER_DURATION_MS = 220;
const DOG_VISION_INDICATOR_EXIT_DURATION_MS = 140;

const useDogVisionIndicator = (active: boolean) => {
  const [visible, setVisible] = useState(false);
  const [animation, setAnimation] = useState(() => new Animated.Value(0));
  const animationRef = useRef(animation);
  const currentAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const stopIndicatorAnimation = useCallback(() => {
    currentAnimationRef.current?.stop();
    currentAnimationRef.current = null;
    animationRef.current.stopAnimation();
  }, []);

  const resetAnimationValue = useCallback(() => {
    const nextAnimation = new Animated.Value(0);
    animationRef.current = nextAnimation;
    setAnimation(nextAnimation);
    return nextAnimation;
  }, []);

  // Hide before the next entrance so the pill remounts at opacity 0 instead of flashing from a previous value.
  const resetEntrance = useCallback(() => {
    stopIndicatorAnimation();
    resetAnimationValue();
    setVisible(false);
  }, [resetAnimationValue, stopIndicatorAnimation]);

  useEffect(() => {
    stopIndicatorAnimation();

    if (active) {
      // Use a fresh Animated.Value for each entrance. Reusing a native-driven value that just ended at 1 can
      // occasionally mount the pill at its final position before the reset reaches the native view.
      const enterAnimationValue = resetAnimationValue();
      setVisible(true);

      // Start one frame after the Dog Vision overlay reports ready so the first Canvas commit does not steal frames
      // from the pill entrance.
      const enterAnimation = Animated.sequence([
        Animated.delay(DOG_VISION_INDICATOR_ENTER_DELAY_MS),
        Animated.timing(enterAnimationValue, {
          toValue: 1,
          duration: DOG_VISION_INDICATOR_ENTER_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

      currentAnimationRef.current = enterAnimation;
      enterAnimation.start(({ finished }) => {
        if (finished) currentAnimationRef.current = null;
      });

      return () => {
        enterAnimation.stop();
        if (currentAnimationRef.current === enterAnimation) currentAnimationRef.current = null;
      };
    }

    const exitAnimationValue = animationRef.current;
    const exitAnimation = Animated.timing(exitAnimationValue, {
      toValue: 0,
      duration: DOG_VISION_INDICATOR_EXIT_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    currentAnimationRef.current = exitAnimation;
    exitAnimation.start(({ finished }) => {
      if (currentAnimationRef.current === exitAnimation) currentAnimationRef.current = null;
      if (finished) setVisible(false);
    });

    return () => {
      exitAnimation.stop();
      if (currentAnimationRef.current === exitAnimation) currentAnimationRef.current = null;
    };
  }, [active, resetAnimationValue, stopIndicatorAnimation]);

  return { animation, resetEntrance, visible };
};

export default useDogVisionIndicator;
