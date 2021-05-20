import React from "react";
import "../styles/cardModal.css";


const ErrorModal = ({showErr, closeErr}) => {
    return (
        <div className={`all__modal ${showErr ? 'show' : ""}`}>
            <div className="all__modal__content">
                <div className="all__modal__header">
                    <h4 className="all__modal__title modal__error">Error</h4>
                </div>
                <div className="all__modal__body">
                    <p>An error occurred when processing the payment!</p>
                </div>
                <div className="all__modal__footer">
                    <button onClick={closeErr} className="all__modal__button">Close</button>
                </div>
            </div>
        </div>
    )
}

export default ErrorModal;

