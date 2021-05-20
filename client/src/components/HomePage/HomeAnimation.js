import React, {Component} from "react";
import Lottie from "react-lottie-player";


class HomeAnimation extends Component {
    render() {
        return (
            <Lottie
                animationData={this.props.animationData}
                loop
                play
                style={this.props.style}
            />
        )
    }
}

export default HomeAnimation;
