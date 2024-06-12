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
        if (!location) return '';

        const { city, country } = location; 
        
        const locationMeta = city && country ? `${city}, ${country}` : city || country || '';
        
        return locationMeta;
    }

    componentDidMount() {
        // this.init();
    };

    selectJob(id) {
        const cookies = Cookies.get('talentAuthToken');
        //url: 'https://talentservicestalentanderson.azurewebsites.net/listing/listing/GetJobByToEdit',
    }

    displayCards() {
        return this.state.cards;
    }

    closeJob(id) {
        const url = 'https://talentservicestalentanderson.azurewebsites.net/listing/listing/closeJob';
        const cookies = Cookies.get('talentAuthToken');

        try {
            if (!id) {
                TalentUtil.notification.show("Job ID is missing", "error", null, null)
                return;
            }

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
                    try {
                        if (res.success == true) {
                            TalentUtil.notification.show(res.message, "success", null, null);
                            window.location = "/ManageJobs";
                           
                        } else {
                            TalentUtil.notification.show(res.message, "error", null, null)
                        }
                    } catch (err) {
                        console.error(err);
                        TalentUtil.notification.show("An error occured. Please try again", "error", null, null)
                    }
                    
                }.bind(this),
                error: function (res) {
                    TalentUtil.notification.show(res.message, "error", null, null)
                }
            })

        } catch (err) {
            console.error(err);
            TalentUtil.notification.show("An error occured. Please try again", "error", null, null)
        }
    }

    render() {
        if (!Array.isArray(this.props.jobData) || !this.props.jobData.length) {
            return null;
        }

        const cards = this.props.jobData.map(job => (
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
        ));

        return (
            <CardGroup itemsPerRow={2}>
                {cards}
            </CardGroup>  
        );
    }
}