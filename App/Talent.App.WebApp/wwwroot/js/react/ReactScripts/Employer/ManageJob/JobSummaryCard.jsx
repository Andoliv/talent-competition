import React from 'react';
import Cookies from 'js-cookie';
import { CardMeta,
    CardHeader,
    CardGroup,
    CardDescription,
    CardContent,
    Button,
    Card,
    Icon,
    Popup } from 'semantic-ui-react';
import moment from 'moment';
import { Link } from 'react-router-dom';

export class JobSummaryCard extends React.Component {
    constructor(props) {
        super(props);
        this.selectJob = this.selectJob.bind(this);

        this.state = {
            jobs: this.props.jobData,
            cards: []
        };
    }

    convertLocation(location) {
        let locationMeta = '';
        if (location) {
            let { city, country } = location;
            if (city && country) {
                locationMeta = `${city}, ${country}`;
            } else if (city) {
                locationMeta = city;
            } else if (country) {
                locationMeta = country;
            }
        }

        return locationMeta;
    }

    init() {
        this.props.jobData.forEach(job => {
            let card = (
                <Card key={job.id} fluid >
                    <CardContent>
                        <CardHeader>{job.title}</CardHeader>
                        <CardMeta>{this.convertLocation(job.location)}</CardMeta>
                        <CardDescription>{job.summary}</CardDescription>
                    </CardContent>
                    <CardContent extra>
                        <div className='ui left floated'>
                            {                                
                                moment(job.expiryDate).isAfter(moment()) ? 
                                    <Button content='Active' color='green' /> : 
                                    <Button content='Expired' color='red' />
                            }     
                        </div>
                        <div className='ui right floated'>
                            <Button basic color='blue' onClick={() => this.closeJob(job.id)}>
                                <Icon name='ban' />
                                Close
                            </Button>
                            <Button basic color='blue' as={Link} to={`/EditJob/${job.id}`}>
                                <Icon name='edit' />
                                Edit
                            </Button>
                            <Button basic color='blue' as={Link} to={`/PostJob/${job.id}`}>
                                <Icon name='copy' />
                                Copy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );

            this.state.cards.push(card);
        });
    }

    componentDidMount() {
        this.init();
    };

    selectJob(id) {
        var cookies = Cookies.get('talentAuthToken');
        //url: 'https://talentservicestalentanderson.azurewebsites.net/listing/listing/GetJobByToEdit',
    }

    closeJob(id) {
        var url = 'https://talentservicestalentanderson.azurewebsites.net/listing/listing/closeJob';
        var cookies = Cookies.get('talentAuthToken');

        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(id),
            dataType: "json",
            success: function (res) {
                if (res.success == true) {
                    TalentUtil.notification.show(res.message, "success", null, null);
                    window.location = "/ManageJobs";
                   
                } else {
                    TalentUtil.notification.show(res.message, "error", null, null)
                }
            }.bind(this),
            error: function (res) {
                console.error(res.status)
            }
        })
    }

    render() {
        return (
            <CardGroup itemsPerRow={2}>
                {this.state.cards}
            </CardGroup>  
        );
    }
}