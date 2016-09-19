const milkcocoa = new MilkCocoa('woodilrg1cz3.mlkcca.com');
const ds = milkcocoa.dataStore('react-chat');

//CommentBox -> CommentList -> Comment
class Comment extends React.Component {
    constructor(props) {
        super(props);
    };

    rawMarkup(){
        let md = new Remarkable();
        let rawMarkup = md.render(this.props.children.toString());
        return { __html: rawMarkup };
    };

    render() {
        let md = new Remarkable();
        return (
            <div className="comment">
                <h2 className="commentAuthor">{this.props.author}</h2>
                <span dangerouslySetInnerHTML={this.rawMarkup()} />
            </div>
        );
    };
};

//CommentBox->CommentList
class CommentList extends React.Component {
    render() {
        let commentNodes = this.props.data.map( (item) => {
            let comment = item.value;
            return (
                <Comment author={comment.author} key={item.id}>
                    {comment.text}
                </Comment>
            );
        });

        return (
            <div className="commentList">{commentNodes}</div>
        );
    };
};

//CommentBox->CommentForm
class CommentForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {author: '', text: ''};
    };
    
    handleAuthorChange (e) {
        this.setState({author: e.target.value});
    };
    
    handleTextChange (e) {
        this.setState({text: e.target.value});
    };
    
    handleSubmit (e) {
        e.preventDefault();
        let author = this.state.author.trim();
        let text = this.state.text.trim();
        if (!text || !author) return;
        this.props.onCommentSubmit({author: author, text: text});
        // this.setState({author: '', text: ''});
        this.setState({text: ''}); //名前は残す
    };

    render() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit.bind(this)}>
                <input
                    type="text"
                    placeholder="名前を入力してね。"
                    value={this.state.author}
                    onChange={this.handleAuthorChange.bind(this)}
                />
                <input
                    type="text"
                    placeholder="マークダウン使えるよ"
                    value={this.state.text}
                    onChange={this.handleTextChange.bind(this)}
                />
                <input type="submit" value="Post" />
            </form>
        );
    };
};

//CommentBox
class CommentBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data: []};
    };
    
    componentDidMount () {
        this.loadCommentsFromServer();
        ds.on('push', this.loadCommentsFromServer.bind(this));
    };

    loadCommentsFromServer () {
        let history = ds.history();
        history.on('data', (data) => {
            this.setState({data: data});
        });
        history.run();
    };

    handleCommentSubmit (comment) {
        ds.push(comment);
    };
    
    render() {
        return (
            <div className="commentBox">
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
                <CommentList data={this.state.data} />
            </div>
        );
    };
};

class App extends React.Component {
    render(){
        return(
            <div className="App">
                <div className="App-header">
                    <img src="../logo.svg" className="App-logo" alt="logo" />
                    <h1>Milkcocoa+Reactでリアルタイムチャット</h1>
                </div>
                <CommentBox />
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('content')
);