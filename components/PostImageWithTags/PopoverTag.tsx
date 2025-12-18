import { useWindowDimensions, View } from "react-native";
import Popover from "react-native-popover-view";
import { PopoverMode } from "react-native-popover-view";

import { COLORS } from "@/constants/Colors";
import { PostImageTag } from "@/types";
import { ImageAspectRatio } from "@/types/post/post";
import { CreatePostImageTag } from "@/types/post/post";
import { getImageHeightAspectAware } from "@/utils/utils";

import Text from "../Text/Text";

type Props = {
  tag: CreatePostImageTag | PostImageTag;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  aspectRatio?: ImageAspectRatio;
};

// Positioning mode is either "pixel" or "percentage".
// If positioning mode is "pixel", then the x and y positions are the actual x and y positions of the tag (pixel values).
// If positioning mode is "percentage", then the x and y positions are the percentages of the screen width and height (percentage values).
// Pixel mode is used when the tag is being created/edited, percentage mode is used when the tag is being displayed from the database.

const PopoverTag = ({ tag, visible, setVisible, aspectRatio = "1:1" }: Props) => {
  const screenWidth = useWindowDimensions().width;
  const imageHeight = getImageHeightAspectAware(screenWidth, aspectRatio);

  // Convert the x and y positions to numbers if they are strings - positions come from the database as a strings
  const safeXPosition = typeof tag.x_position === "string" ? parseFloat(tag.x_position) : tag.x_position;
  const safeYPosition = typeof tag.y_position === "string" ? parseFloat(tag.y_position) : tag.y_position;
  // Use either pixel values or percentage values based on the positioningMode
  // We use screenWidth to convert the y percentage to pixel values because the images are only square.
  const xPosition = screenWidth * (safeXPosition / 100);
  const yPosition = imageHeight * (safeYPosition / 100);

  return (
    <Popover
      isVisible={visible}
      mode={PopoverMode.TOOLTIP}
      onRequestClose={() => setVisible(false)}
      from={
        <View
          key={tag.tagged_profile.id}
          style={{
            position: "absolute",
            left: xPosition,
            top: yPosition,
            width: 0,
            height: 0,
          }}
        />
      }
      popoverStyle={{
        backgroundColor: `${COLORS.sky[900]}E6`,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
      }}
      arrowSize={{ width: 13, height: 10 }}
      testID={`popover-tag-${tag.tagged_profile.username}`}
    >
      <Text style={{ color: COLORS.zinc[100], fontWeight: "600", fontSize: 12 }}>{tag.tagged_profile.username}</Text>
    </Popover>
  );
};

export default PopoverTag;
