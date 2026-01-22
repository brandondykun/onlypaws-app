import { FetchNextPageOptions } from "@tanstack/react-query";
import { InfiniteQueryObserverResult } from "@tanstack/react-query";
import { InfiniteData } from "@tanstack/react-query";

import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";
import { ListSentFollowRequestsResponse } from "@/types/follow-requests/follow-requests";

type Props = {
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: (
    options?: FetchNextPageOptions,
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<ListSentFollowRequestsResponse, unknown>, Error>>;
};

const ListFooterComponent = ({ isFetchingNextPage, isFetchNextPageError, fetchNextPage }: Props) => {
  if (isFetchingNextPage) {
    return <LoadingFooter />;
  }
  if (isFetchNextPageError) {
    return (
      <RetryFetchFooter
        fetchFn={fetchNextPage}
        message="Oh no! There was an error fetching more sent follow requests!"
        buttonText="Retry"
      />
    );
  }
  return null;
};

export default ListFooterComponent;
