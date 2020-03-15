import { compose } from "recompose";
import React, { Component } from "react";

import { AuthUserContext, withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import { Header, Divider, Grid, Form, Button, Modal, Icon } from "semantic-ui-react";
import * as ROUTES from "../../constants/routes";

class ActuatorDetailBaseComponent extends Component {
  state = {
    loading: false,
    actuator: null,
    ...this.props.location.state,
    actuatorName: "",
    actuatorTypeID: "",
    resetCheck: true,
    open: false
  };

    componentDidMount(){
      if (this.state.actuator) {
        console.log("State actuator: ", this.state.actuator);
        console.log("State actuatorTypes: ", this.state.actuatorTypes);
        console.log("Props in detail : ", this.props);
        const actuatorName = this.state.actuator.name;
        this.setState({ actuatorName });
        const actuatorTypeID = this.state.actuator.type;
        this.setState({ actuatorTypeID });
      }

      if(!this.state.actuator){
        this.setState({ loading: true });
        this.props.firebase
          .actuator(this.props.authUser.uid, this.props.match.params.id)
          .get()
          .then(
            snapshot => {
              this.setState({
                actuator: snapshot.data(),
                actuatorName: snapshot.data().name,
                loading: false
              })
            }
          )
      }
      if(!this.state.actuatorTypes.length){
        console.log("no actuators types list");
        this.props.firebase.actuatorTypes()
        .get()
        .then(snapshot => {
          let actuatorTypesList = [];
          snapshot.forEach(
            doc => {
              actuatorTypesList.push( { ...doc.data(), 
                
                uid: doc.id ,
                key: doc.id,
                text: doc.data().name,
                value: doc.id
              })
                console.log("act types list: ", actuatorTypesList);
            }
              
          )
          this.setState({
            actuatorTypes: actuatorTypesList,
            loading: false
          });
        })
      }
  
    }

    onEditActuator = event => {
      event.preventDefault();
      console.log("STATE: ", this.state);
    }
    onChange = (event, result) => {
      const { name, value } = result || event.target;
      console.log("NAME", name);
      console.log("Value", value);
      this.setState({ [name]: value });
    };
    render(){
      const {
        loading,
        actuator,
        actuatorName,
        actuatorTypes,
        actuatorTypeID,
        resetCheck,
         open,
      } = this.state;
        return (
            <div>
              <Header as="h2">Actuator: {actuator.name}</Header>
              <Divider horizontal section>
                Edit actuator
              </Divider>
              <Grid centered columns={2}>
                <Grid.Column>
                  <div>
                    <Form onSubmit={event => this.onEditActuator(event)}>
                      <Form.Field>
                        <label>Name</label>
                        <input
                          name="actuatorName"
                          type="text"
                          value={actuatorName}
                          onChange={this.onChange}
                        />
                      </Form.Field>
                      <Button primary type="submit">
                        Submit
                      </Button>
                    </Form>

                  </div>
                </Grid.Column>
              </Grid>
            </div>
        )
    }


}

const ActuatorDetailPage = props => (
    <AuthUserContext.Consumer>
      {authUser => <ActuatorDetailBaseComponent authUser={authUser} {...props} />}
    </AuthUserContext.Consumer>
  );
  const condition = authUser => !!authUser;
  
  export default compose(
    withFirebase,
    withAuthorization(condition)
  )(ActuatorDetailPage);
  