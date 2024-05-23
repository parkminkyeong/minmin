import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const MyReviewList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 페이지당 항목 수
  const emails = localStorage.getItem('id');

  const openModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/reviews/email/${emails}`);
        if (response.data) {
          setReviewData(response.data);
        } else {
          console.error('Error fetching data: Response body structure is incorrect');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [emails]);

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/reviews/delete/${reviewId}`);
        setReviewData(reviewData.filter(review => review.id !== reviewId));
        window.location.reload()
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const totalPages = Math.ceil(reviewData.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reviewData.slice(startIndex, endIndex);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options).replace(/(\d{2}:\d{2}):\d{2}/, '$1');
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <table className='w-full'>
        <thead className='text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          <tr>
            <th className='py-2'>제목</th>
            <th className='py-2'>내용</th>
            <th className='py-2'>작성날짜</th>
            <th className='py-2'>삭제</th>
          </tr>
        </thead>
        <tbody>
          {getCurrentPageItems().map((review) => (
            <tr key={review.reviewId} className='border-b'>
              <td className='py-2 hover:cursor-pointer' onClick={() => openModal(review)}>
                {truncateText(review.title, 14)}
              </td>
              <td className='py-2 hover:cursor-pointer' onClick={() => openModal(review)}>
                {truncateText(review.content, 23)}
              </td>
              <td className='py-2'>
                {formatDate(review.createdDate)}
              </td>
              <td className='py-2'>
                <button
                  onClick={() => handleDelete(review.reviewId)}
                  className='text-red-500 hover:text-red-700'
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='flex justify-center items-center mt-4'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='px-4 py-2 mx-1 bg-gray-300 rounded disabled:bg-gray-200'
        >
          이전
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='px-4 py-2 mx-1 bg-gray-300 rounded disabled:bg-gray-200'
        >
          다음
        </button>
      </div>

      {selectedReview && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          review={selectedReview}
        />
      )}
    </div>
  );
};

export default MyReviewList;
