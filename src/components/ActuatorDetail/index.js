import React, { Component } from "react";

class ActuatorDetailBaseComponent extends Component {

    componentDidMount(){
        console.log(this.props.location.state);
    }
    render(){
        return (
            <h2> This is detail page </h2>
        )
    }


}

export default ActuatorDetailBaseComponent;