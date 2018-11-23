import React, { Component } from 'react';
import { View, Text, Picker, TextInput, StyleSheet } from 'react-native'
import CountryList from './CountryList.js'

var styles;

export default class InputField extends Component {

    constructor(props) {
        super(props);


        if (this.props.type === 'date') {

            // build years
            let startYear = (new Date()).getFullYear() - 13;
            let years = ["---"];

            let displayYear = startYear - 18;

            for (let i = 0; i < 100; i++) {
                years.push(startYear);
                startYear--;
            }

            let monthDays = this.buildNumberOfDaysForMonth(0, displayYear)

            this.state = {
                month: 1,
                years: years,
                displayYear: displayYear,
                monthDays: monthDays
            };
        } else {
            this.state = {};
        }
    }

    render() {

        if (this.props.type === 'country') {
            return this.renderCountry();
        }

        if (this.props.type === 'date') {
            return this.renderDate();
        }

        let hint;

        if (this.props.hint) {
            hint = (
                <Text style={styles.labelHint}>{this.props.hint}</Text>
            );
        }

        let errorDisplay;
        if (this.state.error) {
            let label = this.props.text.replace(":", "");

            if (this.props.type === 'email') {
                errorDisplay = (
                    <Text style={styles.errorText}>{`Please enter a valid email`}</Text>
                );
            } else {
                errorDisplay = (
                    <Text style={styles.errorText}>{`Please enter '${label}'`}</Text>
                );
            }
        }
        return (
            <View>
                <View style={styles.container}>
                    <Text style={styles.label}>{this.props.text}</Text>
                    <TextInput style={styles.textInput} value={this.props.value} onChangeText={(value) => {
                        this.props.onChange(this.props.cbkey, value);
                    }}
                        onSelectionChange={() => {
                            this.setState({ error: false });
                        }}
                        onFocus={() => {
                            this.setState({ error: false });
                        }}
                        onBlur={() => {
                            if (this.props.type === 'email') {
                                // eslint-disable-next-line
                                let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                this.setState({ error: !re.test(this.props.value) });
                            } else {
                                this.setState({ error: !this.props.value });
                            }
                        }}
                    />
                    {hint}
                </View>
                {errorDisplay}
            </View>
        )
    }

    renderCountry() {
        let errorDisplay;
        if (this.state.error) {
            let label = this.props.text.replace(":", "");
            errorDisplay = (
                <Text style={styles.errorText}>{`Please enter '${label}'`}</Text>
            );
        }
        return (
            <View style={styles.container}>
                <Text style={styles.label}>{this.props.text}</Text>
                <Picker
                    ref={(c) => {

                    }}
                    selectedValue={this.props.value}
                    style={styles.countryPicker}
                    onValueChange={(itemValue, itemIndex) => {
                        if (itemIndex === 0) {
                            itemValue = null;
                        }
                        this.setState({ error: false });
                        this.props.onChange(this.props.cbkey, itemValue);
                    }}
                    onFocus={() => {
                        this.setState({ error: false });
                    }}
                    onblur={() => {
                        this.setState({ error: !this.props.value || this.props.value.indexOf("--") >= 0 });
                    }}
                >
                    {
                        CountryList.map((country) => {
                            return (<Picker.Item key={country} label={country} value={country} />);
                        })
                    }
                </Picker>
                {errorDisplay}
            </View>
        );
    }

    buildNumberOfDaysForMonth(month, year) {
        let daysInMonth = new Date(year, month, 0).getDate();
        let days = ["---"];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }

    renderDate() {
        const months = ["---", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let date = this.props.value;
        let yearVal, monthVal, dayVal;

        if (date) {
            yearVal = date.year || "---";
            monthVal = date.month || "---";
            dayVal = date.day || "---";
        } else {
            yearVal = "---";
            monthVal = "---";
            dayVal = "---";
        }

        return (
            <View style={styles.container}>
                <Text style={styles.label}>{this.props.text}</Text>
                <View style={styles.dateFields}>
                    <Picker
                        selectedValue={monthVal}
                        style={styles.months}
                        onValueChange={(itemValue, itemIndex) => {
                            if (itemIndex === 0) {
                                itemValue = null;
                            }
                            this.props.onChange(this.props.cbkey,
                                { year: yearVal, month: itemValue, day: dayVal });
                        }}>
                        {
                            months.map((month) => {
                                return (<Picker.Item key={month} label={month} value={month} />);
                            })
                        }
                    </Picker>
                    <Picker
                        selectedValue={dayVal}
                        style={styles.days}
                        onValueChange={(itemValue, itemIndex) => {
                            if (itemIndex === 0) {
                                itemValue = null;
                            }
                            this.props.onChange(this.props.cbkey,
                                { year: yearVal, month: itemValue, day: itemValue });
                        }}>{
                            this.state.monthDays.map((day) => {
                                return (<Picker.Item key={day} label={"" + day} value={"" + day} />);
                            })
                        }
                    </Picker>
                    <Picker
                        selectedValue={yearVal}
                        style={styles.years}
                        onValueChange={(itemValue, itemIndex) => {
                            if (itemIndex === 0) {
                                itemValue = null;
                            }
                            this.props.onChange(this.props.cbkey,
                                { year: itemValue, month: itemValue, day: dayVal });
                        }}>{
                            this.state.years.map((year) => {
                                return (<Picker.Item key={year} label={"" + year} value={"" + year} />);
                            })
                        }
                    </Picker>
                </View>
            </View>
        );
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
    sectionTitle: {
        fontSize: 28,
        color: 'rgba(22,22,22, .5)'
    },
    sectionNumberTitle: {
        fontSize: 18,
        color: 'rgb(22,22,22)'

    },
    label: {
        fontFamily : "'Roboto', sans-serif !important",
        fontWeight : 500,
        fontSize: 20,
        color: 'rgba(22,22,22,.5)',
        width: 160,
        marginBottom: 5,
    },
    errorText: {
        color: 'red',
        fontSize: 10
    },
    labelHint: {
        marginTop: 5,
        fontSize: 12,
        alignSelf: 'flex-end',
        fontWeight: 'bold',
        color: 'rgba(22,22,22,.5)',
    },
    textInput: {
        width: 280,
        height: 30,
        backgroundColor: 'lightgray',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
    },
    countryPicker: {
        width: 280,
        height: 30,
        backgroundColor: 'lightgray',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
    },
    dateFields: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    days: {
        width: 60,
        height: 30,
        backgroundColor: 'lightgray',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
        marginRight: 10
    },
    months: {
        width: 100,
        height: 30,
        backgroundColor: 'lightgray',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
        marginRight: 10,
    },
    years: {
        width: 100,
        height: 30,
        backgroundColor: 'lightgray',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,
    }
});
