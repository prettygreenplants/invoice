const AUTH0_CLIENT_ID = "zhMc2mxqBAHIQp7ezbM0x6U0A5MrrlDu";
const AUTH0_DOMAIN = "prettygreenplants.eu.auth0.com";
const AUTH0_CALLBACK_URL = location.href;
const AUTH0_API_AUDIENCE = "https://prettygreenplants.com/api/v1/";

class App extends React.Component {
    parseHash() {
        this.auth0 = new auth0.WebAuth({
            domain: AUTH0_DOMAIN,
            clientID: AUTH0_CLIENT_ID
        });
        this.auth0.parseHash(window.location.hash, (err, authResult) => {
            if (err) {
                return console.log(err);
            }
            if (
                authResult !== null &&
                authResult.accessToken !== null &&
                authResult.idToken !== null
            ) {
                localStorage.setItem("access_token", authResult.accessToken);
                localStorage.setItem("id_token", authResult.idToken);
                localStorage.setItem(
                    "profile",
                    JSON.stringify(authResult.idTokenPayload)
                );
                window.location = window.location.href.substr(
                    0,
                    window.location.href.indexOf("#")
                );
            }
        });
    }

    setup() {
        $.ajaxSetup({
            beforeSend: (r) => {
                if (localStorage.getItem("access_token")) {
                    r.setRequestHeader(
                        "Authorization",
                        "Bearer " + localStorage.getItem("access_token")
                    );
                }
            }
        });
    }

    setState() {
        let idToken = localStorage.getItem("id_token");
        if (idToken) {
            this.loggedIn = true;
        } else {
            this.loggedIn = false;
        }
    }

    componentWillMount() {
        this.setup();
        this.parseHash();
        this.setState();
    }

    render() {
        if (this.loggedIn) {
            return ( < LoggedIn / > );
        } else {
            return ( < Home / > );
        }
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.authenticate = this.authenticate.bind(this);
    }

    authenticate() {
        this.WebAuth = new auth0.WebAuth({
            domain: AUTH0_DOMAIN,
            clientID: AUTH0_CLIENT_ID,
            scope: "openid profile",
            audience: AUTH0_API_AUDIENCE,
            responseType: "token id_token",
            redirectUri: AUTH0_CALLBACK_URL
        });
        this.WebAuth.authorize();
    }

    render() {
        return (
            <div className="container">
                <div className="col-xs-8 col-xs-offset-2 jumbotron text-center">
                    <h1>Pretty Green Plants</h1>
                    <p>Invoice List</p>
                    <p>Sign in to get access</p>
                    <a onClick={this.authenticate} className="btn btn-primary btn-lg btn-login btn-block">
                        Sign In
                    </a>
                </div>
            </div>
        )
    }
}

class LoggedIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            invoices: []
        };
        this.serverRequest = this.serverRequest.bind(this);
        this.logout = this.logout.bind(this);
    }

    logout() {
        localStorage.removeItem("id_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("profile");
        location.reload();
    }

    serverRequest() {
        $.get("http://localhost:3000/api/invoices", res => {
            this.setState({
                invoices: res
            });
        });
    }

    componentDidMount() {
        this.serverRequest();
    }

    render() {
        return (
            <div className="container">
                <br />
                <span className="pull-right">
                    <a href="#" onClick={this.logout}>Log out</a>
                </span>
                <h2>Invoice App</h2>
                <p>Here are your available invoices:</p>
                <div className="row">
                    <div className="container">
                        {
                            this.state.invoices.map(function(invoice, i) {
                                return <Invoice key={i} invoice={invoice} />;
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

class Invoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: "",
            invoices: []
        };
        this.like = this.like.bind(this);
        this.serverRequest = this.serverRequest.bind(this);
    }

    like() {
        let invoice = this.props.invoice;
        this.serverRequest(invoice);
    }

    serverRequest(invoice) {
        $.post(
            "http://localhost:3000/api/invoices/like/" + invoice.id, {
                like: 1
            },
            res => {
                console.log("res... ", res);
                this.setState({
                    liked: "Liked!",
                    invoices: res
                });
                this.props.invoices = res;
            }
        );
    }

    render() {
        return (
            <div className="col-xs-4">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        #{this.props.invoice.id}
                        <span className="pull-right">{this.state.liked}</span>
                    </div>
                    <div className="panel-body invoice-hld">
                        {this.props.invoice.desc}
                    </div>
                    <div className="panel-footer">
                        {this.props.invoice.likes} Likes
                        &nbsp;
                        <a onClick={this.like} className="btn btn-default">
                            <span className="glyphicon glyphicon-thumbs-up" />
                        </a>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
