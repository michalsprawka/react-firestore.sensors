// TODO
// Dodać on listensensortypes na wypadek niepobrania ze location
// Uzupełnić onEditSensor
// Dodać remove sensor i przekierowanie
// implementacja archiwum odczytów

// Dalej dodać sensorTypedetails

import { compose } from "recompose";
import React, { Component } from "react";

import { AuthUserContext, withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import { Header, Divider, Grid, Form, Button, Modal, Icon } from "semantic-ui-react";
import * as ROUTES from "../../constants/routes";
class SensorDetailBaseComponent extends Component {
 // constructor(props) {
   // super(props);

    state = {
      loading: false,
      sensor: null,
      ...this.props.location.state,
      sensorName: "",
      sensorTypeID: "",
      resetCheck: true,
      open: false,
      newCode: "",
      newMACAddress: ""
    };
  //}

  componentDidMount() {
    if (this.state.sensor) {
      console.log("State sensor: ", this.state.sensor);
      console.log("State sensorTypes: ", this.state.sensorTypes);
      console.log("Props in detail : ", this.props);
      const sensorName = this.state.sensor.name;
      this.setState({ sensorName });
      const sensorTypeID = this.state.sensor.type;
      this.setState({ sensorTypeID });
      const newCode = this.state.sensor.code;
      newCode ? this.setState({ newCode }):  this.setState({newCode: ""});
      const newMACAddress = this.state.sensor.MACAddress;
      newMACAddress ? this.setState({newMACAddress}): this.setState({newMACAddress: ""});
    }

    //PORAWIC w props.location.state sensorTypes jest puste
    // gdy w home nie wywołano sensorTypes listeneera
    // trzeba dodać listenera tutaj
    if(!this.state.sensor){
      this.setState({ loading: true });
      this.props.firebase
        .sensor(this.props.authUser.uid, this.props.match.params.id)
        .get()
        .then(
          snapshot => {
            this.setState({
              sensor: snapshot.data(),
              sensorName: snapshot.data().name,
              newCode: snapshot.data().code,
              newMACAddress: snapshot.data.MACAddress,
              loading: false
            })
          }
        )
    }
   
    if(!this.state.sensorTypes.length){
      console.log("no sensors types list");
      this.props.firebase.sensorTypes()
      .get()
      .then(snapshot => {
        let sensorTypesList = [];
        snapshot.forEach(
          doc =>
            sensorTypesList.push( { ...doc.data(), 
              
              uid: doc.id ,
              key: doc.id,
              text: doc.data().name,
              value: doc.id
            })
        )
        this.setState({
          sensorTypes: sensorTypesList,
          loading: false
        });
      })
    }

   
  }

  onEditSensor = event => {
    event.preventDefault();
    console.log("STATE: ", this.state);
    this.props.firebase
      .sensor(this.props.authUser.uid, this.state.sensor.uid)
      .update({
        name: this.state.sensorName,
        type: this.state.sensorTypeID,
        data: this.state.resetCheck ? 0 : this.state.sensor.data,
        MACAddress: this.state.newMACAddress
      });
  };

  onChange = (event, result) => {
    const { name, value } = result || event.target;
    console.log("NAME", name);
    console.log("Value", value);
    this.setState({ [name]: value });
  };
  onChangeCheck = (event, { name, checked }) => {
    console.log("EVENT", checked);
    this.setState({ [name]: checked });
  };

  onRemoveSensor = () => {
   console.log("Remove");
    this.props.firebase
    .sensor(this.props.authUser.uid, this.state.sensor.uid)
    .delete();
    this.props.history.push(ROUTES.HOME)
  }
  close = () => {
    this.setState({open: false});
  }

  open = () => {
    this.setState({open: true});
  }

  onUpdateProgram = (event) => {
    event.preventDefault();
    console.log("In update program", this.state.newCode);
    // this.props.firebase
    //   .sensor(this.props.authUser.uid, this.state.sensor.uid)
    //   .update({
    //     code: this.state.newCode,
    //     programTrigger:  true
    //   });
  }
  render() {
    const {
      sensor,
      sensorName,
      sensorTypes,
      sensorTypeID,
      resetCheck,
      open,
      newCode,
      newMACAddress
    } = this.state;
    const isInvalidEditSensor = sensorName.length < 3 ||
    sensorTypeID === "";
    const isInvalidProgram = newMACAddress.length !== 16 ||
    newCode === ""; 
    

    return (
      <div>
        <Header as="h2">Sensor: {sensor.name}</Header>

        <Divider horizontal section style={{ color: "red" }}>
          Edit sensor
        </Divider>
        <Grid centered columns={2}>
          <Grid.Column>
            <div>
              <Form onSubmit={event => this.onEditSensor(event)}>
                <Form.Field>
                  <label>Name</label>
                  <input
                    name="sensorName"
                    type="text"
                    value={sensorName}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>
                <Form.Select
                  fluid
                  label="Type"
                  name="sensorTypeID"
                  options={sensorTypes}
                  value={sensorTypeID}
                  onChange={this.onChange}
                  // placeholder="choose sensor type"
                />
                <Form.Field>
                  <label>MACAdress</label>
                  <input
                    name="newMACAddress"
                    type="text"
                    value={newMACAddress}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>
                <Form.Checkbox
                  label="Reset reading data ?"
                  name="resetCheck"
                  onChange={this.onChangeCheck}
                  //value={sensorCheck}
                  checked={resetCheck}
                />
                <Button primary type="submit" disabled={isInvalidEditSensor}>
                  Submit
                </Button>
              </Form>
            </div>
            <Divider horizontal section style={{ color: "red" }}>
          Remove sensor
        </Divider>
            <Modal 
           open = {open} 
           closeOnDimmerClick={true}
            onClose={this.close} 
            trigger={<Button onClick={this.open} negative>Remove Sensor ?</Button>} basic size="small">
              <Header icon="question" content="Remove ?" />
              <Modal.Content>
                <p>
                  Would You like to remove sensor ?
                </p>
              </Modal.Content>
              <Modal.Actions>
                <Button basic color="red" inverted onClick={this.close}>
                  <Icon name="remove" /> No
                </Button>
                <Button color="green" inverted onClick= {this.onRemoveSensor}>
                  <Icon name="checkmark" /> Yes
                </Button>
              </Modal.Actions>
            </Modal>

            <Divider horizontal section style={{ color: "red" }}>
              Update program
            </Divider>
            <div>
              <Form onSubmit={event => this.onUpdateProgram(event)}>
              <label>New Code</label>
                <Form.TextArea
                 
                  
                    name="newCode"
                    //type="textarea"
                    value={newCode}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  >
                </Form.TextArea>
               
                <Button primary type="submit" disabled={isInvalidProgram}>
                  Submit
                </Button>
              </Form>
            </div>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

const SensorDetailPage = props => (
  <AuthUserContext.Consumer>
    {authUser => <SensorDetailBaseComponent authUser={authUser} {...props} />}
  </AuthUserContext.Consumer>
);
const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withAuthorization(condition)
)(SensorDetailPage);
