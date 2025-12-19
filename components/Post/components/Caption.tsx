import { useState } from "react";

import CollapsibleText from "@/components/CollapsibleText/CollapsibleText";

type Props = {
  caption: string;
  captionExpandable: boolean;
  postId: number;
  defaultExpanded: boolean;
};

const Caption = ({ caption, captionExpandable, postId, defaultExpanded }: Props) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <CollapsibleText
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
      caption={caption}
      expandable={captionExpandable}
      key={postId.toString()}
    />
  );
};

export default Caption;
