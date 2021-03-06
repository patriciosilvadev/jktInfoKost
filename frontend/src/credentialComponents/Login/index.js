import React, { Component } from 'react'
import loginImg from './login.svg'
import {
    BaseContainer,
    Header,
    Content,
    ImageWrapper,
    Image,
    Form,
    FormGroup,
    Label,
    Input,
    Footer,
    BtnSubmit,
    HyperText
} from './LoginElements'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import axios from 'axios'
import { RESTAPIDOMAIN } from '../../config'
import { trackPromise } from 'react-promise-tracker';
import { Redirect } from "react-router-dom";

export default class index extends Component {

    constructor(props) {
        super(props);

        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeLupaPassword = this.onChangeLupaPassword.bind(this);
        this.onChangeVerifData = this.onChangeVerifData.bind(this);
        this.onClickLogin = this.onClickLogin.bind(this);

        this.state = {
            openForgotPassWindow: false,
            openVerifWindow: false,
            verificationData: '',
            forgotPasswordData: '',
            username: '',
            password: '',
            dialogFlag: false,
            dialogMessage: '',
            dialogSeverity: 'error',
            redirect: false
        };

        this.baseState = this.state;
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    onChangeLupaPassword(e) {
        this.setState({
            forgotPasswordData: e.target.value
        });
    }

    onChangeVerifData(e) {
        this.setState({
            verificationData: e.target.value
        });
    }

    onClickLogin(e) {

        const userLogin = {
            username: this.state.username,
            password: this.state.password,
            actionCode: 1
        }

        let source = axios.CancelToken.source()
        trackPromise(
            axios.post(RESTAPIDOMAIN + '/auth/login', userLogin, {
                cancelToken: source.token
            })
                .then(response => {
                    if (response.data.message) {
                        if (response.data.message) {
                            this.setState({
                                redirect: true
                            });
                        }
                    }
                    else {
                        this.setState({
                            openVerifWindow: false,
                            dialogFlag: true,
                            dialogMessage: response.data.error,
                            dialogSeverity: 'error'
                        });
                    }
                })
                .catch(error => {
                    if (axios.isCancel(error)) {
                        console.log('Request canceled', error.message);
                    } else {
                        // handle error
                        console.log(error);
                    }
                }));
        return () => {
            //when the component unmounts
            console.log("component unmounted");
            // cancel the request (the message parameter is optional)
            source.cancel('Operation canceled by the user.');
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to='/' />
        }


        return (
            <BaseContainer>
                <Header>
                    Masuk
                </Header>
                <Content>
                    <ImageWrapper>
                        <Image src={loginImg} alt="login-page-img" />
                    </ImageWrapper>
                    <Form>
                        <FormGroup>
                            <Label htmlFor="username" >Nama User</Label>
                            <Input type="text" name="username" placeholder="nama user" onChange={this.onChangeUsername} />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="password" >Kata sandi</Label>
                            <Input type="password" name="password" placeholder="kata sandi" onChange={this.onChangePassword} />
                        </FormGroup>
                    </Form>
                </Content>
                <Footer>
                    <BtnSubmit type="button" onClick={this.onClickLogin}>Masuk</BtnSubmit>
                    <HyperText onClick={() => this.setState({ openForgotPassWindow: true })}> Lupa Kata Sandi?</HyperText>
                </Footer>

                {/* Lupa Password Dialog */}
                <Dialog disableBackdropClick disableEscapeKeyDown open={this.state.openForgotPassWindow} onClose={() => this.setState({ openForgotPassWindow: false })} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Atur ulang kata sandi</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Masukkan e-mail atau nomor hp anda. Kami akan mengirimkan anda kode verifikasi.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            onChange={this.onChangeLupaPassword}
                            margin="dense"
                            id="verif-text-field-forgot-pass"
                            label="Email atau Nomer HP yang terdaftar"
                            type="text"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ openForgotPassWindow: false })} color="primary">
                            Batal
                        </Button>
                        <Button onClick={() => this.setState({ openForgotPassWindow: false })} color="primary">
                            Lanjut
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Verif Dialog */}
                <Dialog disableBackdropClick disableEscapeKeyDown open={this.state.openVerifWindow} onClose={() => this.setState({ openVerifWindow: false })} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Masukan kode verifikasi</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Masukkan kode verifikasi yang telah kami kirim ke e-mail atau nomor hp anda.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            onChange={this.onChangeVerifData}
                            margin="dense"
                            id="verif-text-field-login"
                            label="Kode verifikasi"
                            type="text"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ openVerifWindow: false })} color="primary">
                            Batal
                        </Button>
                        <Button onClick={() => this.setState({ openVerifWindow: false })} color="primary">
                            Lanjut
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Message Dialog */}
                <Dialog disableBackdropClick disableEscapeKeyDown open={this.state.dialogFlag} onClose={() => this.setState({ dialogFlag: false })} aria-labelledby="form-dialog-title">
                    <DialogContent>
                        <Alert
                            style={{ marginBottom: '20px', minWidth: '22em' }}
                            severity={this.state.dialogSeverity}
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => this.setState({
                                        dialogFlag: false
                                    })}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            {this.state.dialogMessage}
                        </Alert>
                    </DialogContent>
                </Dialog>
            </BaseContainer>
        )
    }
}
