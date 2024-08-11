import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { UserAvatar } from "./";
import { bookBorrowService } from "../services";
import { setLoading, setInfo } from "../slices";

function BookCopyRow({ bookCopy, ownerId, fetchBook }) {
  const dispatch = useDispatch();
  const jwt = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.authDetails.id);
  async function requestHandler() {
    dispatch(
      setLoading({
        isLoading: true,
        loadingMsg: "request for borrow is sending.",
      })
    );
    console.log("debug comment");
    try {
      // call the service
      const response = await bookBorrowService.requestForBorrow(
        bookCopy.bookId,
        jwt
      );

      // custom status exceptions
      if (!response.ok) {
        throw new Error(await response.json());
      }

      // show success message
      dispatch(
        setInfo({
          shouldShow: true,
          infoMsg: await response.text(),
          infoType: "success",
        })
      );

      fetchBook();
    } catch (error) {
      // set the error
      dispatch(
        setInfo({ shouldShow: true, infoMsg: error.message, infoType: "error" })
      );
    } finally {
      // stop loading
      dispatch(setLoading({ isLoading: false, loadingMsg: "" }));

      // navigate
      navigate("/");
    }
  }

  function getNextAvailabilityDate(dateStr) {
    let date;
    if (dateStr == null) {
      date = new Date();
    } else {
      date = new Date(dateStr.split("-").reverse().join("-"));
      date.setDate(date.getDate() + 30);
    }

    if (bookCopy.borrowerId != ownerId) {
      date.setDate(date.getDate() + 30);
    }
    return date.toISOString().slice(0, 10).split("-").reverse().join("-");
  }

  const isAvailable =
    bookCopy.holderId == ownerId && bookCopy.borrowerId == ownerId;

  let availabilityMessage = "Available";
  if (!isAvailable) {
    const nextAvailableDate = getNextAvailabilityDate(
      bookCopy.holderReceiveDate
    );
    availabilityMessage = `Available after: ${nextAvailableDate}`;
  }

  return (
    <>
      <tr key={bookCopy.bookCopyId} className="border-t border-gray-700">
        <td className="px-4 py-2 block sm:table-cell">
          <span className="lg:hidden text-gray-400">Id: </span>
          {bookCopy.bookCopyId}
        </td>
        <td className="px-4 py-2 block sm:table-cell">
          {bookCopy.requestable && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-lg"
              onClick={requestHandler}
            >
              Borrow
            </button>
          )}
          {!bookCopy.requestable && ownerId != userId && (
            <button className="bg-gray-500 text-white py-1 px-4 rounded-lg cursor-not-allowed opacity-30">
              Borrow
            </button>
          )}
          <p
            className={`${
              isAvailable ? "text-green-600" : "text-orange-500"
            } p-2`}
          >
            {availabilityMessage}
          </p>
        </td>
        <td className="px-4 py-2 block lg:table-cell">
          <span className="lg:hidden text-gray-400">Current Holder: </span>
          {bookCopy.holderId != ownerId ? (
            <UserAvatar
              user={{
                id: bookCopy.holderId,
                name: bookCopy.holderName,
                email: bookCopy.holderEmail,
                profilePhotoURL: bookCopy.holderProfilePhotoURL,
              }}
            />
          ) : (
            <p className="text-yellow-400">owner</p>
          )}
        </td>
        <td className="px-4 py-2 block lg:table-cell">
          <span className="lg:hidden text-gray-400">Next Borrower: </span>
          {bookCopy.borrowerId != ownerId ? (
            <UserAvatar
              user={{
                id: bookCopy.borrowerId,
                name: bookCopy.borrowerName,
                email: bookCopy.borrowerEmail,
                profilePhotoURL: bookCopy.borrowerProfilePhotoURL,
              }}
            />
          ) : (
            <p className="text-yellow-400"> No one </p>
          )}
        </td>
      </tr>
    </>
  );
}

export default BookCopyRow;
