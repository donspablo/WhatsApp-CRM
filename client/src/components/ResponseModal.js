import React, {useRef} from "react";
import {CSSTransition} from "react-transition-group";
import "./styles/responsemodal.css";

const ResponseModal = props => {
    const nodeRef = useRef(null)
    return (
        <CSSTransition
            in={props.showModal}
            unmountOnExit
            timeout={{enter: 0, exit: 300}}
            nodeRef={nodeRef}
        >
            <div ref={nodeRef} onClick={props.onClose} className={`response__modal ${props.showModal ? 'show' : ''}`}>
                <div onClick={e => e.stopPropagation()} className="response__modal__content">
                    <div className="response__modal__header">
                        <h4 className="response__modal__title">{props.title}</h4>
                    </div>
                    <div className="response__modal__body">
                        {props.children}
                    </div>
                    <div className="response__modal__footer">
                        <button onClick={props.onClose} className="response__modal__button">OK</button>
                    </div>
                </div>
            </div>
        </CSSTransition>
    )
}

export default ResponseModal;
