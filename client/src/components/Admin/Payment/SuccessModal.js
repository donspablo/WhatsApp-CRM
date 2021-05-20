import React from "react";
import "../styles/cardModal.css";

const SuccessModal = ({show, onClose, amountPaid}) => {

    let agents;
    let cycle;
    if ((amountPaid % 25) === 0) {
        agents = amountPaid / 25
        cycle = 'month'
    } else {
        agents = amountPaid / (21 * 12)
        cycle = 'year'
    }

    return (
        <div className={`all__modal ${show ? 'show' : ""}`}>
            <div className="all__modal__content">
                <div className="all__modal__header">
                    <h4 className="all__modal__title modal__success">Success</h4>
                </div>
                <div className="all__modal__body">
                    <p>{`You have successfully subscribed for ${agents} agent(s) for 1 ${cycle}!`}</p>
                    <p>You can now add agents to your account</p>
                </div>
                <div className="all__modal__footer">
                    <button onClick={onClose} className="all__modal__button">OK</button>
                </div>
            </div>
        </div>
    )
}

export default SuccessModal;
