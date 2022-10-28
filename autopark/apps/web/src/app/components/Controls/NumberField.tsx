import { TextField } from '@mui/material';
import { ChangeEvent, Component } from 'react';

interface Props {
  label?: string;
  name?: string;
  value?: number;
  defaultValue?: number;
  fullWidth?: boolean;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, value: number) => void;
}

interface State {
  startVal: number;
  value: number;
  snapshot: number;
}

class NumberField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseEnd = this.handleMouseEnd.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.state = { startVal: 0, value: 0, snapshot: 0 };
  }

  handleMouseMove(ev) {
    if (this.state.startVal && this.props.onChange) {
      if (
        this.props.min !== undefined &&
        this.props.value !== undefined &&
        this.props.value <= this.props.min
      ) {
        return;
      }
      if (
        this.props.max !== undefined &&
        this.props.value !== undefined &&
        this.props.value >= this.props.max
      ) {
        return;
      }
      if (this.props.step !== undefined) {
        const val =
          this.state.snapshot +
          Math.floor((ev.clientX - this.state.startVal) / 10) * this.props.step;

        if (this.props.value !== val) {
          this.props.onChange(ev, val);
        }
      } else {
        this.props.onChange(ev, this.state.snapshot + (ev.clientX - this.state.startVal));
      }
    }
  }

  handleMouseEnd(ev) {
    this.setState({ startVal: 0 });
  }

  handleMouseDown(ev) {
    this.setState({
      startVal: ev.clientX,
      snapshot: this.props.value !== undefined ? this.props.value : this.props.defaultValue || 0,
    });
  }

  override componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseEnd);
  }

  override componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseEnd);
  }

  handleChange(ev) {
    if (this.props.onChange) {
      this.props.onChange(ev, parseInt(ev.target.value));
    }
  }

  override render() {
    const {
      label,
      value,
      defaultValue,
      max,
      min,
      step,
      onChange,
      name,
      fullWidth,
      ...other
    } = this.props;
    return (
      <TextField
        label={(label || '')}
        type="number"
        name={name}
        fullWidth={fullWidth}
        InputLabelProps={{
          shrink: true,
        }}
        onMouseDown={this.handleMouseDown}
        variant="standard"
        value={value !== undefined && value.toString() !== '' && !isNaN(value) ? value : defaultValue || ''}
        inputProps={{
          min: min,
          step: step,
          max: max,
          style: { cursor: 'ew-resize', textAlign: 'center' },
        }}
        onChange={this.handleChange}
        {...other}
      />
    );
  }
}

export default NumberField;
