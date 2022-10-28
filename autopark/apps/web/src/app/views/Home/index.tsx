import {
  Add,
  AddPhotoAlternate,
  ArrowBack,
  ArrowForward,
  MonochromePhotos,
  PlayArrow,
  Remove,
  Save,
} from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  Slider,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { Component } from 'react';
import { BAContext } from '../../utils';

interface Props {}

interface State {}

class Home extends Component<Props, State, typeof BAContext> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  static override contextType = BAContext;

  override context!: React.ContextType<typeof BAContext>;

  override render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12}></Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={12}></Grid>
      </Grid>
    );
  }
}

export default Home;
