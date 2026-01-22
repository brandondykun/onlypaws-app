import LoadingFooter from "@/components/LoadingFooter/LoadingFooter";
import RetryFetchFooter from "@/components/RetryFetchFooter/RetryFetchFooter";

type Props = {
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
};

const FooterComponent = ({ isFetchingNextPage, isFetchNextPageError, fetchNextPage }: Props) => {
  if (isFetchingNextPage) {
    return <LoadingFooter />;
  }

  if (isFetchNextPageError) {
    return (
      <RetryFetchFooter
        fetchFn={fetchNextPage}
        message="Oh no! There was an error fetching more posts!"
        buttonText="Retry"
      />
    );
  }

  return null;
};

export default FooterComponent;
