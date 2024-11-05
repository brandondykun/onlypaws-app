import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { PostCommentDetailed, PostDetailed, PostLike } from "@/types";

dayjs.extend(relativeTime);

export const getTimeSince = (pastDate: string) => {
  const output = dayjs().from(pastDate, true);
  return `${output} ago`;
};

export const likePostInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  newPostLike: PostLike,
) => {
  stateSetter((prev) => {
    return prev.map((post) => {
      if (post.id === newPostLike.post) {
        return { ...post, likes: [...post.likes, newPostLike] };
      }
      return post;
    });
  });
};

export const unlikePostInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  postId: number,
  authProfileId: number,
) => {
  stateSetter((prev) => {
    return prev.map((prevPost) => {
      if (prevPost.id === postId) {
        return { ...prevPost, likes: prevPost.likes.filter((like) => like.profile !== authProfileId) };
      }
      return prevPost;
    });
  });
};

export const addCommentInState = (
  stateSetter: React.Dispatch<React.SetStateAction<PostDetailed[]>>,
  comment: PostCommentDetailed,
  postId: number,
) => {
  stateSetter((prev) => {
    return prev.map((prevPost) => {
      if (prevPost.id === postId) {
        return {
          ...prevPost,
          comments_count: prevPost.comments_count + 1,
          comments: [...prevPost.comments, comment],
        };
      }
      return prevPost;
    });
  });
};

export const abbreviateNumber = (num: number) => {
  if (num < 1000) {
    return num;
  } else if (num < 1000000) {
    const decimal = num / 1000;
    const rounded = Math.floor(decimal * 10) / 10;
    return `${rounded}K`;
  } else if (num < 1000000000) {
    const decimal = num / 1000000;
    const rounded = Math.floor(decimal * 10) / 10;
    return `${rounded}M`;
  } else if (num < 1000000000000) {
    const decimal = num / 1000000000;
    const rounded = Math.floor(decimal * 10) / 10;
    return `${rounded}B`;
  }
};
