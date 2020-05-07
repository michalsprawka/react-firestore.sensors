import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";
import * as ROUTES from "../../constants/routes";
import { SignUpLink } from "../SignUp";

import {
  Header,
  Loader,
  Table,
  Button,
  Card,
  Form,
  Divider
} from "semantic-ui-react";

const AdminPage = () => (
  <div>
    <Header as="h2">Admin</Header>
    <p>The Admin Page is accessible by every signed in admin user.</p>

    <Switch>
    <Route  exact path={ROUTES.ADMIN_SENSORTYPES_DETAILS}  component={SensorTypeItem} />
    <Route  exact path={ROUTES.ADMIN_ACTUATORTYPES_DETAILS}  component={ActuatorTypeItem} />
      <Route exact path={ROUTES.ADMIN_USERS_DETAILS} component={UserItem} />
      
      <Route exact path={ROUTES.ADMIN} component={UserList} />
      
    </Switch>
  </div>
);

class UserListBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: [],
      sensorTypes: [],
      actuatorTypes: [],
      sensorName: "",
      sensorDescription: "",
      detailedSensorDescription: "",
      detailedActuatorDescription: "",
      sensorCode: "",
      actuatorCode: "",
      actuatorName: "",
      actuatorDescription: "",
      modalindex: 0
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.unsubscribeUsers = this.props.firebase.users().onSnapshot( snapshot => {
      let usersList = []; 
      snapshot.forEach(
        doc => usersList.push({
          ...doc.data(), uid: doc.id
        })
       )
      this.setState({
        users: usersList,
        loading: false
      });
    });

   this.unsubscribeSensorTypes = this.props.firebase.sensorTypes()
   .onSnapshot( snapshot => {
      let sensorTypesList = [];
      snapshot.forEach(
        doc => sensorTypesList.push({
          ...doc.data(), uid: doc.id
        })
      )
        this.setState({
          sensorTypes: sensorTypesList,
          loading: false
        }); 
    });

    this.unsubscribeActuatorTypes = this.props.firebase.actuatorTypes()
    .onSnapshot( snapshot => {
       let actuatorTypesList = [];
       snapshot.forEach(
         doc => actuatorTypesList.push({
           ...doc.data(), uid: doc.id
         })
       )
         this.setState({
           actuatorTypes: actuatorTypesList,
           loading: false
         }); 
     });

  }

  componentWillUnmount() {
   this.unsubscribeUsers();
   this.unsubscribeSensorTypes();
   this.unsubscribeActuatorTypes();
  }
 
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onCreateSensorType = event => {
    event.preventDefault();
    this.props.firebase.sensorTypes().add({
      name: this.state.sensorName,
      description: this.state.sensorDescription,
      detailedDescription: this.state.detailedSensorDescription,
      code: this.state.code
    });
  };

  onCreateActuatorType = event => {
    event.preventDefault();
    console.log(
      "in state",
      this.state.actuatorName,
      this.state.actuatorDescription
    );
    this.props.firebase.actuatorTypes().add({
      name: this.state.actuatorName,
      description: this.state.actuatorDescription,
      modalindex: this.state.modalindex,
      code: this.state.code
    });
  };

  render() {
    const {
      users,
      loading,
      sensorName,
      sensorDescription,
      detailedSensorDescription,
      sensorCode,
      actuatorCode,
      sensorTypes,
      actuatorName,
      actuatorDescription,
      detailedActuatorDescription,
      actuatorTypes,
      modalindex
    } = this.state;

    return (

      //Users table ********************************************************************
      <div>
        <Header as="h1" style={{color: "blue"}}>Users</Header>
        {loading ? (
          <Loader active inline />
        ) : (
          <Table singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Username</Table.HeaderCell>
                <Table.HeaderCell>Email Address</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((user, i) => (
                <Table.Row key={i}>
                  <Table.Cell>{user.uid}</Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Button
                      primary
                      as={Link}
                      to={{
                        pathname: `${ROUTES.ADMIN_USERS}/${user.uid}`,
                        state: { user }
                      }}
                    >
                      Details
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        {/* New User ***************************************************************************************** */}

        <Divider horizontal section style={{ color: "red" }}>
          New User
        </Divider>
        <SignUpLink />
        <Header as="h1" style={{color: "blue"}}>Sensor Types</Header>

        {/* SensorTypes table ***************************************************************************************** */}

        <Divider horizontal section style={{ color: "red" }}>
          SensorTypes
        </Divider>
        <Table fixed singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Type Name</Table.HeaderCell>
              <Table.HeaderCell>Type Description</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sensorTypes && sensorTypes.map((type, i) => (
              <Table.Row key={i}>
                <Table.Cell>{type.uid}</Table.Cell>
                <Table.Cell>{type.name}</Table.Cell>
                <Table.Cell>{type.description}</Table.Cell>
                <Table.Cell>
                  <Button primary as={Link} to={{
                     pathname: `${ROUTES.ADMIN_SENSORTYPES}/${type.uid}`,
                     state: { type }
                  }}>
                    Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
          {/* New Sensor type ***************************************************************************************** */}
        <Divider horizontal section style={{ color: "red" }}>
          New Sensor Type
        </Divider>
        <Form onSubmit={event => this.onCreateSensorType(event)}>
          <Form.Field>
            <label>Name</label>
            <input
              name="sensorName"
              type="text"
              value={sensorName}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <input
              name="sensorDescription"
              type="text"
              value={sensorDescription}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Detailed description</label>
            <textarea
              name="detailedSensorDescription"
              type="textarea"
              value={detailedSensorDescription}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Proposed program</label>
            <textarea
              name="sensorCode"
              type="textarea"
              value={sensorCode}
              onChange={this.onChange}
            />
          </Form.Field>
          <Button primary type="submit">
            Submit
          </Button>
        </Form>
        {/* Actuator Types table ***************************************************************************************** */}
        <Header as="h1" style={{color: "blue"}}>Actuator Types</Header>
        <Divider horizontal section style={{ color: "red" }}>
          ActuatorTypes
        </Divider>
        <Table fixed singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Type Name</Table.HeaderCell>
              <Table.HeaderCell>Type Description</Table.HeaderCell>
              <Table.HeaderCell>Modal Index</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {actuatorTypes && actuatorTypes.map((type, i) => (
              <Table.Row key={i}>
                <Table.Cell>{type.uid}</Table.Cell>
                <Table.Cell>{type.name}</Table.Cell>
                <Table.Cell>{type.description}</Table.Cell>
                <Table.Cell>{type.modalindex}</Table.Cell>

                <Table.Cell>
                  <Button primary as={Link} to={{
                     pathname: `${ROUTES.ADMIN_ACTUATORTYPES}/${type.uid}`,
                     state: { type }
                  }}>
                    Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
              {/* New Actuator Type ***************************************************************************************** */}
        <Divider horizontal section style={{ color: "red" }}>
          New Actuator Type
        </Divider>
        <Form onSubmit={this.onCreateActuatorType}>
          <Form.Field>
            <label>Name</label>
            <input
              name="actuatorName"
              type="text"
              value={actuatorName}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Modal Index</label>
            <input
              name="modalindex"
              type="number"
              value={modalindex}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <textarea
              name="actuatorDescription"
              type="textarea"
              value={actuatorDescription}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Detailed description</label>
            <textarea
              name="detailedActuatorDescription"
              type="textarea"
              value={detailedActuatorDescription}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Proposed program</label>
            <textarea
              name="actuatorCode"
              type="textarea"
              value={actuatorCode}
              onChange={this.onChange}
            />
          </Form.Field>
          <Button primary type="submit">
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}

class UserItemBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      user: null,
      ...props.location.state
    };
  }

  componentDidMount() {
    if (this.state.user) {
      console.log("State user: ", this.state.user);
      return;
    }

    this.setState({ loading: true });

    this.unsubscribeUser =this.props.firebase
      .user(this.props.match.params.id)
      .onSnapshot(snapshot => {
        this.setState({
          user: snapshot.data(),
          loading: false
        });
      });
  }

  componentWillUnmount() {
    this.unsubscribeUser && this.unsubscribeUser();
  //  this.props.firebase.user().off();
  }

  onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email);
  };

  render() {
    const { user, loading } = this.state;

    return (
      <>
        <Card fluid={true}>
          {loading ? (
            <Loader active inline="centered" />
          ) : (
            <Card.Content>
              <Card.Header>User: {user.uid}</Card.Header>
              <Card.Description>
                {user && (
                  <div>
                    <Card.Content>
                      <Card.Meta>
                        <span>Username: {user.username}</span>
                      </Card.Meta>
                      <Card.Description>{user.email}</Card.Description>
                      <br />
                      <Button
                        primary
                        type="button"
                        onClick={this.onSendPasswordResetEmail}
                      >
                        Send Password Reset
                      </Button>
                    </Card.Content>
                  </div>
                )}
              </Card.Description>
            </Card.Content>
          )}
        </Card>
      </>
    );
  }
}



class SensorTypeItemBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      type: null,
      ...props.location.state,
      editedName: "",
      editedDescription: "",
      editedDetailedDescription: "",
      editedCode: ""
    };
  }

  componentDidMount() {

    console.log("State: ", this.state);

    const editedName = this.state.type.name;
    editedName ? this.setState({ editedName }):  this.setState({editedName: ""});

    const editedDescription = this.state.type.description;
    editedDescription ? this.setState({ editedDescription }):  this.setState({editedDescription: ""});

    const editedDetailedDescription = this.state.type.detailedDescription;
    editedDetailedDescription ? this.setState({ editedDetailedDescription }):  this.setState({editedDetailedDescription: ""});

    const editedCode = this.state.type.code;
    editedCode ? this.setState({ editedCode }):  this.setState({editedCode: ""});

    }

 onEditSensor = event => {

 }

 onChange = (event, result) => {
  const { name, value } = result || event.target;
  console.log("NAME", name);
  console.log("Value", value);
  this.setState({ [name]: value });
};

  render() {
    const {  loading,editedName,editedDescription,editedDetailedDescription,editedCode, type } = this.state;
   

    return (
      <div>
        <Header as="h2"> Sensor Type: {type.name}</Header>

        <Divider horizontal section style={{ color: "red" }}>
          Edit sensor Type
        </Divider>
       
            <div>
              <Form onSubmit={event => this.onEditSensor(event)}>
                <Form.Field>
                  <label>Name</label>
                  <input
                    name="editedName"
                    type="text"
                    value={editedName}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>
              
                
                <Form.Field>
                  <label>Description</label>
                  <input
                    name="editedDescription"
                    type="text"
                    value={editedDescription}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>
                <Form.Field>
                <label>Detailed description</label>
                <Form.TextArea
                    name="editedDetailedDescription"
                    value={editedDetailedDescription}
                    onChange={this.onChange}
                />

                </Form.Field>
                
                <Form.Field>
                <label>Proposed code</label>
                <Form.TextArea
                    name="editedCode"
                    value={editedCode}
                    onChange={this.onChange}
                />
                </Form.Field>
                  
              
               
                <Button primary type="submit" >
                  Submit
                </Button>
              </Form>
              </div>
              </div>
    );
  }
}


class ActuatorTypeItemBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      type: null,
      ...props.location.state,
      editedName: "",
      editedDescription: "",
      editedModalIndex: -1,
      editedDetailedDescription: "",
      editedCode: ""
    };
  }

  componentDidMount() {

    console.log("State: ", this.state);

    const editedName = this.state.type.name;
    editedName ? this.setState({ editedName }):  this.setState({editedName: ""});

    const editedDescription = this.state.type.description;
    editedDescription ? this.setState({ editedDescription }):  this.setState({editedDescription: ""});

    const editedDetailedDescription = this.state.type.detailedDescription;
    editedDetailedDescription ? this.setState({ editedDetailedDescription }):  this.setState({editedDetailedDescription: ""});

    const editedCode = this.state.type.code;
    editedCode ? this.setState({ editedCode }):  this.setState({editedCode: ""});

    const editedModalIndex = this.state.type.modalindex;
    editedModalIndex || editedModalIndex === 0 ? this.setState({ editedModalIndex }):  this.setState({editedModalIndex: -1});

    }

 onEditSensor = event => {

 }

 onChange = (event, result) => {
  const { name, value } = result || event.target;
  console.log("NAME", name);
  console.log("Value", value);
  this.setState({ [name]: value });
};

  render() {
    const {  loading,editedName,editedDescription,editedDetailedDescription,editedCode, editedModalIndex, type } = this.state;
   

    return (
      <div>
        <Header as="h2"> Actuator Type: {type.name}</Header>

        <Divider horizontal section style={{ color: "red" }}>
          Edit Actuator Type
        </Divider>
       
            <div>
              <Form onSubmit={event => this.onEditSensor(event)}>
                <Form.Field>
                  <label>Name</label>
                  <input
                    name="editedName"
                    type="text"
                    value={editedName}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>
              
                
                <Form.Field>
                  <label>Description</label>
                  <input
                    name="editedDescription"
                    type="text"
                    value={editedDescription}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>

                <Form.Field>
                  <label>Modal Index</label>
                  <input
                    name="editedModalIndex"
                    type="number"
                    value={editedModalIndex}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>

                <Form.Field>
                <label>Detailed description</label>
                <Form.TextArea
                    name="editedDetailedDescription"
                    value={editedDetailedDescription}
                    onChange={this.onChange}
                />

                </Form.Field>
                
                <Form.Field>
                <label>Proposed code</label>
                <Form.TextArea
                    name="editedCode"
                    value={editedCode}
                    onChange={this.onChange}
                />
                </Form.Field>
              
               
                <Button primary type="submit" >
                  Submit
                </Button>
              </Form>
              </div>
              </div>
    );
  }
}
const UserList = withFirebase(UserListBase);
const UserItem = withFirebase(UserItemBase);
const SensorTypeItem = withFirebase(SensorTypeItemBase);
const ActuatorTypeItem = withFirebase(ActuatorTypeItemBase);

const condition = authUser =>
  // authUser && authUser.roles.includes(ROLES.ADMIN);
  authUser && authUser.isAdmin;

export default compose(withAuthorization(condition))(AdminPage);
