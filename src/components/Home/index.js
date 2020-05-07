import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import {
  Grid,
  Form,
  Button,
  Header,
  Table,
  Loader,
  Divider,
  Modal,
  Icon
} from "semantic-ui-react";

import { AuthUserContext, withAuthorization } from "../Session";

import { withFirebase } from "../Firebase";

import * as ROUTES from "../../constants/routes";

class HomeBaseComponent extends Component {
  state = {

    sensors: [],
    sensorTypes: [],
    actuatorTypes: [],
    actuators: [],
    // for editing
    sensorName: "",
    sensorTypeID: "",
    sensorCheck: false,
    actuatorName: "",
    actuatorTypeID: "",
    sensorMACAddress: "",
    actuatorMACAddress: "",
    //for display
    loading: false,
    open: false,
    addSensorVisible: false,
    addSensorLoading: false,
    addActuatorVisible: false,
    addActuatorLoading: false,
    rpiReady: false

  };

  componentDidMount() {
    this.onListenSensors();
    this.onListenActuators();
    this.onListenUser();
  }

  componentWillUnmount() {
    this.unsubscribeSensors();
    this.unsubscribeActuators();
    this.unsubscribeSensorTypes && this.unsubscribeSensorTypes();
    this.unsubscribeActuatorTypes && this.unsubscribeActuatorTypes();
    this.unsubscribeUser();
  }

  // Listeners ***************************************************************************************


  onListenUser = () => {
    this.setState({ loading: true });
    this.unsubscribeUser = this.props.firebase
      .user(this.props.authUser.uid)
      .onSnapshot(snapshot => {
        this.setState({rpiReady: snapshot.data().rpiReady})
      })
  }


  onListenSensors = () => {
    this.setState({ loading: true });
    this.unsubscribeSensors = this.props.firebase
      .sensors(this.props.authUser.uid)
      .onSnapshot(snapshot => {
        if (snapshot.size) {
          let sensorsList = [];
          snapshot.forEach(doc =>
            sensorsList.push({ ...doc.data(), uid: doc.id })
          );
          //console.log("sensorsList:  ", sensorsList);
          // console.log("DATE:  ", new Date(sensorsList[0].readingDate.toDate()).toLocaleString());
          this.setState({
            sensors: sensorsList,
            loading: false
          });
        } else {
          this.setState({ sensors: null, loading: false });
        }
      });
  };

  onListenActuators = () => {
    this.setState({ loading: true });
    this.unsubscribeActuators = this.props.firebase
      .actuators(this.props.authUser.uid)
      .onSnapshot(snapshot => {
        if (snapshot) {
          let actuatorsList = [];
          snapshot.forEach(doc =>
            actuatorsList.push({ ...doc.data(), uid: doc.id, openModal: false })
          );
          //console.log("actuatorsList:  ", actuatorsList);
          this.setState({
            actuators: actuatorsList,
            loading: false
          });
        } else {
          this.setState({ actuators: null, loading: false });
        }
      });
  };

  onListenSensorTypes = () => {
    this.setState({ addSensorLoading: true });
    this.unsubscribeSensorTypes = this.props.firebase
      .sensorTypes()
      .onSnapshot(snapshot => {
        if (snapshot) {
          let sensorTypesList = [];
          snapshot.forEach(doc =>
            sensorTypesList.push({
              ...doc.data(),

              uid: doc.id,
              key: doc.id,
              text: doc.data().name,
              value: doc.id
            })
          );
          //   console.log("sensorTypesList:  ", sensorTypesList);
          this.setState({
            sensorTypes: sensorTypesList,
            addSensorLoading: false
          });
        } else {
          this.setState({ sensorTypes: null, addSensorLoading: false });
        }
      });
  };


  onListenActuatorTypes = () => {
    this.setState({ addActuatorLoading: true });
    this.unsubscribeActuatorTypes = this.props.firebase
      .actuatorTypes()
      .onSnapshot(snapshot => {
        if (snapshot) {
          let actuatorTypesList = [];
          snapshot.forEach(doc =>
            actuatorTypesList.push({
              ...doc.data(),

              uid: doc.id,
              key: doc.id,
              text: doc.data().name,
              value: doc.id
            })
          );
          //   console.log("actuatorTypesList:  ", actuatorTypesList);
          this.setState({
            actuatorTypes: actuatorTypesList,
            addActuatorLoading: false
          });
        } else {
          this.setState({ actuatorTypes: null, addActuatorLoading: false });
        }
      });
  };


  // Adders ***************************************************************************************

  onAddSensor = event => {
    event.preventDefault();
    this.props.firebase.sensors(this.props.authUser.uid).add({
      data: 0,
      readingDate: this.props.firebase.fieldValue.serverTimestamp(),
      name: this.state.sensorName,
      type: this.state.sensorTypeID,
      cameraTrigger: false,
      programTrigger: false,
      code: "",
      MACAddress: this.state.sensorMACAddress
    });
    // console.log("New key", newKey);
    //console.log("CLICKED");
  };

  onAddActuator = event => {
    event.preventDefault();
    const actuatorTypeModalindex = this.state.actuatorTypes.find(
      type => type.key === this.state.actuatorTypeID
    ).modalindex;
    this.props.firebase.actuators(this.props.authUser.uid).add({
      state: 0,
      changingDate: this.props.firebase.fieldValue.serverTimestamp(),
      name: this.state.actuatorName,
      type: this.state.actuatorTypeID,
      typeModalIndex: actuatorTypeModalindex,
      programTrigger: false,
      code: "",
      MACAddress: this.state.actuatorMACAddress
    });

  };

  makePhoto = (uid) => {
    // console.log("UID:  ", uid);
    this.props.firebase
      .sensor(this.props.authUser.uid, uid)
      .update({ cameraTrigger: true });
  }

  toggleState = (uid, state) => {
    //  console.log("modal uid: ", uid, "state: ", state);
    if (state === 0) {
      this.props.firebase
        .actuator(this.props.authUser.uid, uid)
        .update({ state: 1 });
    } else {
      this.props.firebase
        .actuator(this.props.authUser.uid, uid)
        .update({ state: 0 });
    }
    this.setState({ open: false });
  };


  //Others ***********************************************************************************


  onChange = (event, result) => {
    const { name, value } = result || event.target;
    // console.log("NAME", name);
    // console.log("Value", value);
    this.setState({ [name]: value });
  };

  close = index => {
    const actuatorsArray = [...this.state.actuators];
    // console.log("index", index);
    actuatorsArray[index].openModal = false;

    this.setState({ actuators: actuatorsArray });
  };

  open = index => {
    const actuatorsArray = [...this.state.actuators];
    //  console.log("actuatorsArray", actuatorsArray);
    actuatorsArray[index].openModal = true;
    this.setState({ actuators: actuatorsArray });
  };



  onAddSensorVisible = () => {
    // console.log("listen sens types call");
    this.onListenSensorTypes();
    this.setState({ addSensorVisible: true });
  };
  onAddActuatorVisible = () => {
    this.onListenActuatorTypes();
    this.setState({ addActuatorVisible: true });
  };



  render() {
    const {
      sensors,
      actuators,
      sensorName,
      actuatorName,
      loading,
      sensorTypes,
      sensorTypeID,
      actuatorTypeID,
      actuatorTypes,
      addSensorVisible,
      addSensorLoading,
      addActuatorVisible,
      addActuatorLoading,
      sensorMACAddress,
      actuatorMACAddress,
      rpiReady
    } = this.state;
    // console.log("sensor type ID", sensorTypeID);

    const isInvalidAddSensor = sensorName.length < 3 ||
         sensorTypeID === "";
    const isInvalidAddActuator = actuatorName < 3 ||
         actuatorTypeID === "";

    const getModal = (index, state, uid, i, openModal) => {
      const ModalArray = [
        <Modal
          open={openModal}
          closeOnDimmerClick={true}
          onClose={() => this.close(i)}
          // st={actuator.state}
          //content="your state"
          trigger={<Button onClick={() => this.open(i)}>Change!</Button>}
          basic
          size="small"
        >
          <Header icon="lightbulb outline" content="Change state of actuator" />
          <Modal.Content>
            <p>Your current state is {state}, would you like change it?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color="red" inverted onClick={() => this.close(i)}>
              <Icon name="remove" /> No
            </Button>
            <Button
              color="green"
              inverted
              onClick={() => this.toggleState(uid, state)}
            >
              <Icon name="checkmark" /> Yes
            </Button>
          </Modal.Actions>
        </Modal>
      ];
      return ModalArray[index];
    };

    return (
      <div style={{ margin: "30px" }}>
        <Header as="h2" textAlign="center">
          Home Page You are logged as {this.props.authUser.username}
          </Header>
          <Header as="h4" textAlign="center">
          {rpiReady ?  <p>Your Rpi hub is connected :)</p>: 
          <p>Your Rpi hub is not connected. Connect your Rpi hub.</p>}
        </Header>
        {loading ? (
          <Loader active inline />
        ) : (
            <>

              {/* Sensor list ********************************************************** */}

              <Divider horizontal section style={{ color: "red" }}>
                Your sensors
            </Divider>
              <Table singleLine>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>name</Table.HeaderCell>
                    <Table.HeaderCell>data</Table.HeaderCell>
                    <Table.HeaderCell>date of read</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sensors &&
                    sensors.map((sensor, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>{sensor.uid}</Table.Cell>
                        <Table.Cell>{sensor.name}</Table.Cell>
                        {sensor.type === "99GtB2mqawKEQAyHiFgH" ? //sensor type camera
                          <Table.Cell><a href={sensor.data}>Download Photo</a></Table.Cell> :
                          <Table.Cell>{sensor.data}</Table.Cell>
                        }
                        <Table.Cell>
                          {sensor.readingDate &&
                            new Date(
                              sensor.readingDate.toDate()
                            ).toLocaleString()}
                        </Table.Cell>

                        <Table.Cell>
                          {sensor.type === "99GtB2mqawKEQAyHiFgH" ? //sensortype camera
                            <Button onClick={() => this.makePhoto(sensor.uid)}>Make photo</Button>
                            : null
                          }
                          <Button
                            primary
                            as={Link}
                            to={{
                              pathname: `${ROUTES.SENSOR_DETAILS}/${sensor.uid}`,
                              state: { sensor, sensorTypes }
                            }}
                          >
                            Detail
                        </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>

              {/* Actuators list ********************************************************** */}

              <Divider horizontal section style={{ color: "red" }}>
                Your actuators
            </Divider>
              <Table singleLine>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>name</Table.HeaderCell>
                    <Table.HeaderCell>Current state</Table.HeaderCell>
                    <Table.HeaderCell>date of changing</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {actuators &&
                    actuators.map((actuator, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>{actuator.uid}</Table.Cell>
                        <Table.Cell>{actuator.name}</Table.Cell>
                        <Table.Cell>{actuator.state}</Table.Cell>
                        <Table.Cell>
                          {actuator.changingDate &&
                            new Date(
                              actuator.changingDate.toDate()
                            ).toLocaleString()}
                        </Table.Cell>

                        <Table.Cell>

                          {getModal(
                            parseInt(actuator.typeModalIndex),
                            actuator.state,
                            actuator.uid,
                            i,
                            actuator.openModal
                          )}

                          <Button primary as={Link} to={{
                            pathname: `${ROUTES.ACTUATOR_DETAILS}/${actuator.uid}`,
                            state: { actuator, actuatorTypes }
                          }}>
                            Detail
                        </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>


              {/* New sensor ********************************************************** */}

              <Divider horizontal section style={{ color: "red" }}>
                Add new sensor
            </Divider>

              <Grid centered columns={2}>
                <Grid.Column>
                  {addSensorLoading ? (
                    <Loader active inline />
                  ) : (
                      <>
                        {!addSensorVisible && (
                          <Button primary onClick={this.onAddSensorVisible}>
                            Add Sensor
                      </Button>
                        )}
                        <div>
                          {addSensorVisible && (
                            <Form onSubmit={event => this.onAddSensor(event)}>
                              <Form.Field>
                                <label>Sensor`s name</label>
                                <input
                                  name="sensorName"
                                  type="text"
                                  value={sensorName}
                                  onChange={this.onChange}
                                  placeholder="think about name of your sensor..."
                                />
                              </Form.Field>
                              <Form.Select
                                fluid
                                label="Type"
                                name="sensorTypeID"
                                options={sensorTypes}
                                value={sensorTypeID}
                                onChange={this.onChange}
                                placeholder="choose sensor type"
                              />
                              {/* <Form.Checkbox label='I agree to the Terms and Conditions' 
                          onChange={this.onChangeSensorCheck}
                          //value={sensorCheck}
                          checked={sensorCheck }

                      /> */}
                              <Form.Field>
                                <label>MAC Address of endpoint</label>
                                <input
                                  name="sensorMACAddress"
                                  type="text"
                                  value={sensorMACAddress}
                                  onChange={this.onChange}
                                  placeholder="MACAdress of your xbee endpoint"
                                />
                              </Form.Field>
                              <Button primary type="submit" disabled={isInvalidAddSensor}>
                                Submit
                          </Button>
                            </Form>
                          )}
                        </div>
                      </>
                    )}
                </Grid.Column>
              </Grid>

              {/* New actuator ********************************************************** */}

              <Divider horizontal section style={{ color: "red" }}>
                Add new actuator
            </Divider>
              <Grid centered columns={2}>
                <Grid.Column>
                  {addActuatorLoading ? (
                    <Loader active inline />
                  ) : (
                      <>
                        {!addActuatorVisible && (
                          <Button primary onClick={this.onAddActuatorVisible}>
                            Add Actuator
                      </Button>
                        )}
                        <div>
                          {addActuatorVisible && (
                            <Form onSubmit={event => this.onAddActuator(event)}>
                              <Form.Field>
                                <label>Actuator`s name</label>
                                <input
                                  name="actuatorName"
                                  type="text"
                                  value={actuatorName}
                                  onChange={this.onChange}
                                  placeholder="think about name of your actuator.."
                                />
                              </Form.Field>
                              <Form.Select
                                fluid
                                label="Type"
                                name="actuatorTypeID"
                                options={actuatorTypes}
                                value={actuatorTypeID}
                                onChange={this.onChange}
                                placeholder="choose actuator type"
                              />

                              <Form.Field>
                                <label>MAC Address of endpoint</label>
                                <input
                                  name="actuatorMACAddress"
                                  type="text"
                                  value={actuatorMACAddress}
                                  onChange={this.onChange}
                                  placeholder="MACAdress of your xbee endpoint"
                                />
                              </Form.Field>
                              <Button primary type="submit" disabled={isInvalidAddActuator}>
                                Submit
                          </Button>
                            </Form>
                          )}
                        </div>
                      </>
                    )}
                </Grid.Column>
              </Grid>
            </>
          )}
      </div>
    );
  }
}
const HomePage = props => (
  <AuthUserContext.Consumer>
    {authUser => <HomeBaseComponent authUser={authUser} {...props} />}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

//const condition = genek => !!genek;

export default compose(withFirebase, withAuthorization(condition))(HomePage);
