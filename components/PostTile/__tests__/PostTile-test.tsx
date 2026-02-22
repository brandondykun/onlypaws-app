import "@testing-library/jest-native/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { PostDetailed } from "@/types";

import PostTile from "../PostTile";

describe("<PostTile />", () => {
  test("onPress is called when tile is pressed", () => {
    const mockOnPress = jest.fn();

    const mockPost: PostDetailed = {
      id: 1,
      public_id: "post-1",
      caption: "Test Mock Post",
      profile: {
        id: 2,
        public_id: "12345",
        is_private: false,
        profile_type: "regular",
        username: "test_username",
        about: "Test about.",
        image: null,
        name: "Test name",
        pet_type: { id: 1, name: "dog" },
        breed: "Test breed",
      },
      created_at: "12345",
      updated_at: "56789",
      images: [
        {
          id: 5,
          post: 3,
          image: "images/1234.jpg",
          localImageUri: "file://images/1234.jpg",
          public_id: "12345",
          order: 1,
          tags: [],
          scaled_images: [],
        },
      ],
      comments_count: 1,
      likes_count: 1,
      liked: false,
      is_saved: false,
      reports: [],
      is_hidden: false,
      is_reported: false,
      contains_ai: false,
      tagged_profiles: [],
      aspect_ratio: "1:1",
      status: "READY",
    };

    render(<PostTile post={mockPost} index={1} onPress={mockOnPress} />);
    const tile = screen.getByTestId("post-tile-pressable");

    expect(tile).toBeTruthy();
    fireEvent(tile, "press");
    expect(mockOnPress).toHaveBeenCalled();
  });
});
