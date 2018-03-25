import React, { Component, Fragment } from 'react';
import './App.css';
import DATA from './data.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleCellChange = this.handleCellChange.bind(this);
    this.handleFileLoad = this.handleFileLoad.bind(this);
  }
  handleFileLoad(result) {
    this.setState({data: JSON.parse(result)});
  }
  handleCellChange({row, col}, value) {
    this.setState((prevState) => {
      let newData = prevState.data;
      let keys = Object.keys(newData[0]);
      newData[row][keys[col]] = value;
      return {data: newData};
    });
  }
  render() {
    return (
      <Fragment>
        <FileLoader onFileLoad={this.handleFileLoad}/>
        <FilterableTable
          onCellChange={this.handleCellChange}
          data={this.state.data}/>
      </Fragment>
    );
  }
}

class FilterableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {filterText: ''};
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleCellChange = this.handleCellChange.bind(this);
  }
  handleTextChange(text) {
    this.setState({filterText: text});
  }
  handleCellChange(coords, value) {
    this.props.onCellChange(coords, value);
  }
  render() {
    return (
      <Fragment>
        <SearchBar
          onTextChange={this.handleTextChange}
          filterText={this.state.filterText}/>
        <DataTable
          filterText={this.state.filterText}
          onCellChange={this.handleCellChange}
          data={this.props.data}/>
      </Fragment>
    );
  }
}

class FileLoader extends Component {
  constructor(props) {
    super(props);
    this.handleFileLoad = this.handleFileLoad.bind(this);
  }
  handleFileLoad() {
    for (let file of this.input.files) {
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        this.props.onFileLoad(reader.result);
      });
      reader.readAsText(file);
    }
  }
  render() {
    return (
      <input
        type='file'
        onChange={this.handleFileLoad}
        ref={(input) => { this.input = input; }}/>
    );
  }
}

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.handleTextChange = this.handleTextChange.bind(this);
  }
  handleTextChange(event) {
    this.props.onTextChange(event.target.value);
  }
  render() {
    return (
      <form>
        <input
          type='text'
          value={this.props.filterText}
          onChange={this.handleTextChange} />
      </form>
    )
  }
}

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {sortIndex: 0, order: 'asc'};
    this.handleCellChange = this.handleCellChange.bind(this);
    this.handleHeaderClick = this.handleHeaderClick.bind(this);
  }
  handleCellChange(coords, value) {
    this.props.onCellChange(coords, value);
  }
  handleHeaderClick(sortIndex) {
    this.setState((prevState) => {
      let order = (prevState.order === 'asc' && prevState.sortIndex === sortIndex) ? 'desc' : 'asc';
      return {sortIndex, order};
    });
  }
  render() {
    let data = this.props.data;

    if (!data) return false;

    let keys = Object.keys(data[0]);
    let headers = <HeaderRow onHeaderClick={this.handleHeaderClick} row={Object.keys(data[0])}/>
    let dataRows = [];

    data.sort((a, b) => {
      let key = keys[this.state.sortIndex];
      if (a[key] > b[key]) return (this.state.order === 'asc') ? 1 : -1;
      else return (this.state.order === 'asc') ? -1 : 1;
    });

    data.forEach((row, index) => {
      row = Object.values(row);

      if (row.every(cell => String(cell).indexOf(this.props.filterText) === -1)) return;

      dataRows.push(<DataRow
        onCellChange={this.handleCellChange}
        key={row.id || index}
        rowIndex={index}
        data={row}/>);
    });

    return (
      <table className='data-table'>
        <thead>
          {headers}
        </thead>
        <tbody>
          {dataRows}
        </tbody>
      </table>
    );
  }
}

class HeaderRow extends Component {
  constructor(props) {
    super(props);
    this.handleHeaderClick = this.handleHeaderClick.bind(this);
  }
  handleHeaderClick(sortIndex) {
    this.props.onHeaderClick(sortIndex);
  }
  render() {
    return (
      <tr>
        {this.props.row.map((header, index) => <th
          key={index}
          className='cell-header'
          onClick={this.handleHeaderClick.bind(this, index)}>{header}</th>)}
      </tr>
    );
  }
}

class DataRow extends Component {
  constructor(props) {
    super(props);
    this.handleCellChange = this.handleCellChange.bind(this);
  }

  handleCellChange(coords, value) {
    this.props.onCellChange(coords, value);
  }
  render() {
    return (
      <tr>
        {
          this.props.data.map((_, col) => {
            let row = this.props.rowIndex;

            return (
              <td  key={col} className='cell'>
                <DataCell
                  row={row}
                  col={col}
                  value={this.props.data[col]}
                  onCellChange={this.handleCellChange}/>
              </td>
            );
          })
        }
      </tr>
    );
  }
}

class DataCell extends Component {
  constructor(props) {
    super(props);
    this.state = {focus: false};
    this.handleCellChange = this.handleCellChange.bind(this);
    this.handleCellBlur = this.handleCellBlur.bind(this);
    this.handleCellFocus = this.handleCellFocus.bind(this);
  }
  handleCellBlur() {
    this.setState({focus: false});
  }
  handleCellFocus(event) {
    this.setState({focus: true});
  }
  handleCellChange(coords, event) {
    this.props.onCellChange(coords, event.target.value);
    // this.setState({width: this.cell.offsetWidth});
  }
  componentDidMount() {
    // this.setState({width: this.cell.offsetWidth});
  }
  componentDidUpdate() {
    if (this.state.focus) {
      this.cell.focus();
      let len = this.cell.value.length;
      this.cell.selectionStart = len;
      this.cell.selectionEnd = len;
    }
  }
  render() {
    const row = this.props.row;
    const col = this.props.col;
    const cell = (this.state.focus) ?
          (<input
            className='cell-input'
            type='text'
            onClick={this.handleCellFocus}
            onBlur={this.handleCellBlur}
            onChange={this.handleCellChange.bind(this, {row, col})}
            ref={(cell) => {this.cell = cell;}}
            // style={{width: this.state.width}}
            value={this.props.value} />) :
          (<span
            className='cell-span'
            onClick={this.handleCellFocus}
            onBlur={this.handleCellBlur}
            // style={{minWidth: this.state.width}}
            ref={(input) => { this.cell = cell; }}>
              {this.props.value}
           </span>);
    return cell;
  }
}

export default App;
