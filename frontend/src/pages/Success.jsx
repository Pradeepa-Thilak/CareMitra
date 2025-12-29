import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentSuccessModalOrder from "../components/modals/PaymentSuccessModalOrder";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);
  const [modalData, setModalData] = useState(null);

 useEffect(() => {
  if (!location.state) return; // ⛔ wait

  if (location.state?.data) {
    setModalData({
      ...location.state.data,
      type: "order",
    });
  } else {
    navigate("/");
  }
}, [location.state, navigate]);

  const handleModalClose = () => {
    setModalOpen(false);
    navigate("/orders");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {modalData && (
        <PaymentSuccessModalOrder
          open={modalOpen}
          onClose={handleModalClose}
          data={modalData}
        />
      )}
    </div>
  );
};

export default Success;
