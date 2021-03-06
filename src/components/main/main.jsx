const React = require('react');
const _ = require('lodash');
const ocrService = require('../../services/ocrService');
const CodesTable = require('../codesTable/codesTable');

module.exports = React.createClass({
  getInitialState() {
    return {
      codes: [],
      isUploading: false,
      loadingText: '',
      loadingTime: 0
    };
  },

  componentDidMount() {
    ocrService.getCodes()
      .then(codes => this.setState({codes: codes}))
      .catch(e => console.error('An error occured', e));
  },

  loadingStart() {
    this.setState({isUploading: true});
    let id = setInterval(() => {
      this.setState({loadingTime: ++this.state.loadingTime});
    }, 200);

    return () => {
      this.setState({isUploading: false});
      clearInterval(id);
    };
  },

  getLoadingText() {
    let dots = _.repeat('.', this.state.loadingTime % 6);
    return 'analyzing' + dots;
  },

  onChangeFile(evt) {
    var that = this;
    let file = evt.target.files[0];
    let reader = new FileReader();

    reader.onload = function(evt) {
      let binaryData = evt.target.result;
      let loadingStop = that.loadingStart();

      ocrService.save(binaryData)
        .then(codes => {
          that.setState({codes: codes});
          new Notification('Your card was saved', {
            body: codes.length + 'of 148 codes were found'
          });
        })
        .catch(err => {
          new Notification('An error occured', {
            body: err
          });
        })
        .finally(loadingStop);
    };

    reader.readAsBinaryString(file);
  },

  onClickUpload() {
    document.querySelector('.upload-container input').click();
  },

  hasCodes() {
    return !_.isEmpty(this.state.codes);
  },

  getButtonText() {
    if (this.state.isUploading) {
      return this.getLoadingText();
    }
    return this.hasCodes() ? 'Replace NemId' : 'Select NemId';
  },

  render() {
    let uploadInput = (
      <div className="upload-container" onClick={this.onClickUpload}>
        <span>{this.getButtonText()}</span>
        <input type="file" onChange={this.onChangeFile} accept=".gif,.jpg,.jpeg,.png"></input>
      </div>
    );
    let codesTable = <CodesTable codes={this.state.codes}></CodesTable>;

    return (
      <div className={'main-container ' + (!this.hasCodes() ? 'splash-screen' : '')}>
        {this.hasCodes() ? codesTable : ''}
        {uploadInput}
      </div>
    );
  }
});
