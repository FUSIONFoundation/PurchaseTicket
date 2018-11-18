

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

var styles;
var indexNumber = 0;
var imageUploadImage = require("../../images/upload.svg")

export default class ImageUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = { file: '', imagePreviewUrl: '', error: '', indexNumber };
        let obj = this.state;
        if ( this.props.imgData ) {
            obj.file = this.props.imgData.file;
            obj.imagePreviewUrl = this.props.imgData.imagePreviewUrl;
        }
        indexNumber += 1;
        this.idOfObject = "imagedrop" + indexNumber;
        this.dragOverIt = this.dragOver.bind(this);
        this.fileSelectIt = this.fileSelect.bind(this);
    }

    _handleImageChange(e) {
        e.preventDefault();

        if (!e.target || !e.target.files || e.target.files.length === 0) {
            return;
        }

        this.processFile( e.target.files[0]);
    }

    processFile( f ) {
        let reader = new FileReader();
        let file = f;

        reader.onloadend = () => {
            if (reader.result.length < 400000) {
                this.setState({ error: "The image is too small, please select another", file: '' });
                return;
            } else if (reader.result.length > 4 * (1024 * 1024)) {
                this.setState({ error: "The image is too large, please select another", file: '' });
                return;
            }
            this.setState({
                file: file,
                error: null,
                imagePreviewUrl: reader.result
            });
            this.props.onImage( {
                file : file,
                imagePreviewUrl : reader.result
            });
        }

        reader.readAsDataURL(file)
    }

    dragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; 
    }

    fileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        // files is a FileList of File objects. List some properties.
        for (let i = 0, f; ; i++) {
            f = files[i];
            this.processFile( f );
            return;
        }
    }

    render() {
        let { imagePreviewUrl } = this.state;
        let $imagePreview = null;
        if (imagePreviewUrl) {
            $imagePreview = (<Image style={styles.imageSelected}
                source={{ uri: imagePreviewUrl }} />);
        } else {
            $imagePreview = null;
        }
        let errorText;

        if (this.state.error) {
            errorText = (<Text key="error" style={styles.errorText}>{this.state.error}</Text>);
        }

        return (
            <View id={this.idOfObject} style={styles.container} ref={(c) => {
                let dropZone = document.getElementById(this.idOfObject);
                dropZone.addEventListener('dragover', this.dragOverIt, false);
                dropZone.addEventListener('drop', this.fileSelectIt, false);
            }}  >
                <input style={{ display: 'none' }}
                    id={"myfileInputObject" + this.state.indexNumber}
                    type="file" accept=".png, .jpg, .jpeg"
                    onChange={(e) => this._handleImageChange(e)} />
                <Text style={styles.titleText}>{this.props.title}</Text>
                <TouchableOpacity onPress={() => {
                    document.getElementById("myfileInputObject" + this.state.indexNumber).click();
                }}>
                    <View style={styles.imageArea}>
                        {$imagePreview}
                        <Image source={imageUploadImage} style={styles.imageUpload} />
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.selectImageText}>Choose file or drag here</Text>
                            <Text style={styles.selectImageText}>Size Limit: 4MB</Text>
                        </View>
                    </View>
                    {errorText}
                </TouchableOpacity>
            </View>
        )
    }
}


styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        marginTop: 10,
    },
    imageSelected: {
        position: 'absolute',
        top: 10,
        bottom: 0,
        right: 0,
        left: 30,
        width: 100,
        height: 100,
        opacity: .9,
    },
    errorText: {
        fontSize: 14,
        color: '#8F0000',
        width: 160,
        marginBottom: 5,
    },
    imageArea: {
        width: 160,
        height: 120,
        borderColor: 'black',
        borderWidth: 1,
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'column',
        backgroundColor: 'rgb(245,245,245)',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: 30,
    },
    imageUpload: {
        width: 40,
        height: 30,
        marginTop: 20,
    },
    selectImageText: {
        fontSize: 10,
        color: '#4C4C4C',
        textAlign: 'center'
    },
    labelHint: {
        marginTop: 5,
        fontSize: 12,
        alignSelf: 'flex-end',
        fontWeight: 'bold',
        color: 'rgba(22,22,22,.5)',
    },
    titleText: {
        color: '#222222',
        textAlign: 'left',
        fontSize: 12,
        marginBottom: 10,
    },
    textInput: {
        width: 280,
        height: 30,
        backgroundColor: 'lightgray',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
    },
});
