// src/pages/Success.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentSuccessModal from "../components/modals/PaymentSuccessModal";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(true);
  const [modalData, setModalData] = React.useState(null);

  useEffect(() => {
    if (location.state) {
      setModalData({
        ...location.state.data,
        type: location.state.type || "order"
      });
    } else {
      // No data, redirect to home
      navigate("/");
    }
  }, [location.state, navigate]);

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalData?.type === "appointment") {
      navigate("/appointments");
    } else {
      navigate("/orders");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PaymentSuccessModal
        open={modalOpen}
        onClose={handleModalClose}
        data={modalData}
      />
      <div className="text-center">
        <h2 className="text-xl font-semibold">Processing your payment...</h2>
      </div>
    </div>
  );
};

export default Success;