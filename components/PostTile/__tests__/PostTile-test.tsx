import "@testing-library/jest-native/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react-native";

import PostTile from "../PostTile";
import { PostDetailed } from "@/types";

describe("<PostTile />", () => {
  test("onPress is called when tile is pressed", () => {
    const mockOnPress = jest.fn();

    const mockPost: PostDetailed = {
      id: 1,
      caption: "Test Mock Post",
      profile: {
        id: 2,
        username: "test_username",
        about: "Test about.",
        image: null,
        name: "Test name",
        pet_type: { id: 1, name: "dog" },
        breed: "Test breed",
      },
      created_at: "12345",
      updated_at: "56789",
      images: [{ id: 5, post: 3, image: "images/1234.jpg" }],
      comments_count: 1,
      likes_count: 1,
      liked: false,
      is_saved: false,
      reports: [],
      is_hidden: false,
      is_reported: false,
      contains_ai: false,
    };

    render(<PostTile post={mockPost} index={1} onPress={mockOnPress} />);
    const tile = screen.getByTestId("post-tile-pressable");

    expect(tile).toBeTruthy();
    fireEvent(tile, "press");
    expect(mockOnPress).toHaveBeenCalled();
  });
});
