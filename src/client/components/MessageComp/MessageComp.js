import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../_redux/actions.js';

import Icon from '../Icon/Icon';

import styles from './MessageComp.scss';

const mapDispatchToProps = {
  toggleErrorMessage: actions.toggleErrorMessage
}

const mapStateToProps = state => ({
  errorMessage: state.errorMessage.message
});

class MessageComp extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyUp);
  }

  UNSAFE_componentWillMount() {
    document.removeEventListener('keydown', this.handleKeyUp);
  }

  handleKeyUp(event) {
    if(event.keyCode !== 27) {
      return;
    }
    this.props.toggleErrorMessage(false);
  }

  render() {
    const { message, toggleErrorMessage, errorMessage } = this.props;

    return (
      <div className={styles['message-comp']}>
        <div className={styles['message-comp__main']}>
          <div className={styles['message-comp__main__text']}>
            <h1>{`${message}`}</h1>
          </div>
          <div className={styles['message-comp__main__button']}>
          {
            !errorMessage
            ?  <Icon iconName='Spinner' />
            :  <div className={styles['message-comp__main__button__item']}>
                  <button onClick={toggleErrorMessage(false)}><span>Close</span></button>
                  <span className={styles['escape']}>{`/ ESC`}</span>
              </div>
          }
          </div>
        </div>
      </div>
    )  
  }
}

MessageComp.displayName = 'MessageComp';

export default connect(mapStateToProps, mapDispatchToProps)(MessageComp);