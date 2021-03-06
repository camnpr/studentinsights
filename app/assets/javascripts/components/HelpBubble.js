import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import React from 'react';

export default class HelpBubble extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      modalIsOpen: false
    };

    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  componentWillMount(){
    // This needs to be called for some reason, and we need to do it by the time the DOM exists.
    ReactModal.setAppElement(document.body);
  }

  closeModal(e){
    this.setState({modalIsOpen: false});
    e.preventDefault();
  }

  openModal(e){
    this.setState({modalIsOpen: true});
    e.preventDefault();
  }

  render(){
    const {style, linkStyle, tooltip} = this.props;
    return (
      <div style={{...styles.root, ...style}}>
        <a href="#" title={tooltip} onClick={this.openModal} style={{...styles.link, ...linkStyle}}>
          {this.props.teaser}
        </a>
        {// The modal is not logically here, but even while not displayed it needs a location in the DOM.
        this.renderModal()}
      </div>
    );
  }

  renderModal(){
    const {title, content, modalStyle} = this.props;
    // There are three ways to close a modal dialog: click on one of the close buttons,
    // click outside the bounds, or press Escape.

    return (
      <ReactModal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={{...styles.modal, ...modalStyle}}>
        {// Every help box has a title and two close buttons. The content is free-form HTML.
        <div className="modal-help">
          <div style={styles.titleBar}>
            <h1 style={styles.title}>{title}</h1>
            <a
              href="#"
              onClick={this.closeModal}
              style={styles.escapeLink}>
              (ESC)
            </a>
          </div>
          <div>{content}</div>
          {/* Fills the empty space */}
          <div style={{flex: 1, minHeight: 20}}>{""}</div>
          <div>
            <a href="#" onClick={this.closeModal} style={{cursor: 'pointer'}}>
              (close)
            </a>
          </div>
        </div>}
      </ReactModal>
    );
  }
}

HelpBubble.propTypes = {
  title: PropTypes.string.isRequired, // e.g. 'What is a Note?'
  content: PropTypes.node.isRequired, // React DOM objects which will be displayed in the modal text box.
  teaser: PropTypes.node.isRequired, // text displayed before the user clicks, e.g. 'Find out more.'
  style: PropTypes.object,
  linkStyle: PropTypes.object,
  modalStyle: PropTypes.object,
  tooltip: PropTypes.string
};

const styles = {
  root: {
    display: 'inline',
    marginLeft: 10
  },
  link: {
    fontSize: 12,
    outline: 'none'
  },
  modal: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: '#555',
  },
  titleBar: {
    borderBottom: '1px solid #333',
    paddingBottom: 10,
    marginBottom: 20
  },
  title: {
    display: 'inline-block',
    fontSize: 24
  },
  escapeLink: {
    float: 'right',
    cursor: 'pointer'
  }
};


// For `modalStyle` so it appears to be coming from the right side of the page.
export const modalFromRight = {
  content: {
    right: 40,
    left: 'auto',
    bottom: 'auto',
    width: '55%'
  }
};

export const modalFromLeft = {
  content: {
    left: 40,
    right: 'auto',
    bottom: 'auto',
    width: '55%'
  }
};

export const modalFullScreenWithVerticalScroll = {
  content: {
    top: 40,
    bottom: 40,
    left: 80,
    right: 80
  }
};
