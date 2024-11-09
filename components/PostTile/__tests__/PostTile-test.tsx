import "@testing-library/jest-native/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react-native";

import PostTile from "../PostTile";

describe("<PostTile />", () => {
  test("onPress is called when tile is pressed", () => {
    const mockOnPress = jest.fn();

    const mockPost = {
      id: 1,
      caption: "Test Mock Post",
      profile: {
        id: 2,
        username: "test_username",
        about: "Test about.",
        image: null,
        name: "Test name",
      },
      created_at: "12345",
      updated_at: "56789",
      images: [{ id: 5, post: 3, image: "images/1234.jpg" }],
      likes: [
        {
          id: 6,
          post: 8,
          profile: 10,
          liked_at: "12345",
        },
      ],
      comments: [
        {
          id: 24,
          text: "Test comment",
          post: 3,
          profile: {
            id: 2,
            username: "test_username",
            about: "Test about.",
            image: null,
            name: "Test name",
          },
          created_at: "2134532",
        },
      ],
      comments_count: 1,
    };

    render(<PostTile post={mockPost} index={1} onPress={mockOnPress} />);
    const tile = screen.getByTestId("post-tile-pressable");

    expect(tile).toBeTruthy();
    fireEvent(tile, "press");
    expect(mockOnPress).toHaveBeenCalled();
  });
});
