import LoadingFooter from "../LoadingFooter/LoadingFooter";
import RetryFetchFooter from "../RetryFetchFooter/RetryFetchFooter";

type Props = {
  isLoading: boolean;
  isError: boolean;
  fetchNextPage: () => void;
  message?: string;
  buttonText?: string;
};

// Footer component for a list that displays a loading indicator when more data is loading,
// or an error message and a button to retry the fetch when an error occurs.

const LoadingRetryFooter = ({ isLoading, isError, fetchNextPage, message, buttonText }: Props) => {
  if (isLoading) {
    return <LoadingFooter />;
  }

  if (isError) {
    return (
      <RetryFetchFooter
        fetchFn={fetchNextPage}
        message={message || "There was an error!"}
        buttonText={buttonText || "Retry"}
      />
    );
  }

  return null;
};

export default LoadingRetryFooter;
