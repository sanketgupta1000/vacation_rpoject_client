import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setInfo, setSingleBook } from "../slices";
import { bookService } from "../services";
import { BookCopyRow, UserAvatar, BackGround } from "./";

function Book() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { bookId } = useParams();

  const jwt = useSelector((state) => state.auth.token);

  // using singleBook from the store
  const bookData = useSelector((state) => state.book.singleBook);

  // function to fetch data
  async function fetchBook() {
    dispatch(setLoading({ isLoading: true, loadingMsg: "Loading book..." }));

    try {
      const response = await bookService.getBookCopies(jwt, bookId);

      if (!response.ok) {
        throw new Error((await response.json()).message);
      }

      const data = await response.json();

      dispatch(setSingleBook(data));
    } catch (error) {
      dispatch(
        setInfo({ shouldShow: true, infoMsg: error.message, infoType: "error" })
      );
      navigate("/");
    } finally {
      dispatch(setLoading({ isLoading: false, loadingMsg: "" }));
    }
  }

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  return (
    <BackGround>
      <div className="p-4 w-full bg-white/10 rounded-lg shadow-2xl shadow-orange-500/30 text-white">
        <div className="grid grid-cols-5">
          <div className="col-span-5 sm:col-span-2 xl:col-span-1 flex justify-center items-center w-full p-4">
            <img
              src={bookData.coverPhotoURL}
              alt={bookData.bookTitle}
              className="aspect-[5/8] w-60 object-cover"
            />
          </div>
          <div className="col-span-5 sm:col-span-3 xl:col-span-4 p-4">
            <h1 className="text-4xl font-bold mb-4">{bookData.bookTitle}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              <div className="col">
                <p className="text-xl mb-2">
                  <strong>Author:</strong> {bookData.bookAuthor}
                </p>
              </div>
              <div className="col">
                <p className="text-lg mb-2">
                  <strong>Page Count:</strong> {bookData.bookPageCount}
                </p>
              </div>
              <div className="col">
                <p className="text-lg mb-2">
                  <strong>Category:</strong> {bookData.bookCategoryName}
                </p>
              </div>
              <div className="col">
                <p className="text-lg mb-2">
                  <strong>City:</strong> {bookData.bookOwnerCity}
                </p>
              </div>
              <div className="col">
                <p className="text-lg mb-2">
                  <strong>Uploaded On:</strong> {bookData.bookUploadDate}
                </p>
              </div>
              <div className="col lg:col-span-2">
                <div className="mt-4">
                  <h2 className="text-2xl font-semibold mb-2">Owner</h2>
                  <UserAvatar
                    user={{
                      id: bookData.bookOwnerId,
                      name: bookData.bookOwnerName,
                      email: bookData.bookOwnerEmail,
                      profilePhotoURL: bookData.bookOwnerProfilePhotoURL,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-5 flex items-start justify-center p-4">
            {/* Book Copies Section */}
            <div className="w-full overflow-x-auto">
              <table className="w-full bg-gray-800 rounded-2xl border-2 border-white">
                <thead>
                  <tr className="hidden lg:table-row">
                    <th className="px-4 py-2">Index</th>
                    <th className="px-4 py-2">Borrow</th>
                    <th className="px-4 py-2">Current Holder</th>
                    <th className="px-4 py-2">Next Borrower</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {bookData.bookCopies.map((copy, index) => (
                    <BookCopyRow
                      bookCopy={copy}
                      ownerId={bookData.bookOwnerId}
                      fetchBook={fetchBook}
                    ></BookCopyRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </BackGround>
  );
}

export default Book;
