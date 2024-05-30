import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        //your functions go here
        this.handleFilterChange = this.handleFilterChange.bind(this);
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        //this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        this.loadData(() =>
           this.setState({ loaderData })
        )
        
        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
       // your ajax call and other logic goes here
       $.ajax({
        url: link,
        headers: {
          'Authorization': 'Bearer ' + cookies,
          'Content-Type': 'application/json'
          },
          type: "GET",
          contentType: "application/json",
          dataType: "json",
          data: {
              activePage: this.state.activePage,
              sortbyDate: this.state.sortBy.date,
              showActive: this.state.filter.showActive,
              showClosed: this.state.filter.showClosed,
              showDraft: this.state.filter.showDraft,
              showExpired: this.state.filter.showExpired,
              showUnexpired: this.state.filter.showUnexpired
          },
          success: function (res) {
              let loaderData = TalentUtil.deepCopy(this.state.loaderData);
              loaderData.isLoading = false;

              this.setState({
                  loadJobs: res.myJobs,
                  totalPages: Math.ceil(res.totalCount / 6),
                  loaderData
              });

              if (callback) callback();
            }.bind(this),
            error: function (res) {
                console.error(res.message);
                TalentUtil.notification.show("Error while loading data", "error", null, null)
            }
        })
    }

    handleFilterChange(event, data) {
        var value = data.value;

        var filter = TalentUtil.deepCopy(this.state.filter);

        if (value == 'showActive') {
            filter.showActive = true;
        }
        else if (value == 'showClosed') {
            filter.showClosed = true;
        }
        else if (value == 'showDraft') {
            filter.showDraft = true;
        }
        else if (value == 'showExpired') {
            filter.showExpired = true;
        }
        else if (value == 'showUnexpired') {
            filter.showUnexpired = true;
        }
        
        this.setState({filter: filter}, () => this.loadData());
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    render() {
        var filterOptions = [
            { key: 'showActive', text: 'Show Active', value: 'showActive' },
            { key: 'showClosed', text: 'Show Closed', value: 'showClosed' },
            { key: 'showDraft', text: 'Show Draft', value: 'showDraft' },
            { key: 'showExpired', text: 'Show Expired', value: 'showExpired' },
            { key: 'showUnexpired', text: 'Show Unexpired', value: 'showUnexpired' }
        ]

        var sortOptions = [
            { key: 'desc', text: 'Newest first', value: 'Newest first' },
            { key: 'asc', text: 'Oldest first', value: 'Oldest first' }
        ]

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
               <div className ="ui container">
                    <div className="ui grid">
                        <div className="ui sixteen wide column">
                            <h3>List of Jobs</h3>
                            <div className="ui grid">
                                    <div className="ui four wide column">
                                        <span>
                                            <Icon name='filter' />
                                            Filter: {' '}
                                            <Dropdown 
                                                inline 
                                                placeholder="Choose filter" 
                                                selection 
                                                options={filterOptions} 
                                                onChange={this.handleFilterChange}
                                            />
                                        </span>
                                    </div>
                                    <div className="ui six wide column">
                                        <span>
                                            <Icon name='calendar alternate outline' />
                                                Sort by date: {' '}
                                            <Dropdown inline placeholder="Newest first" selection options={sortOptions} defaultValue={sortOptions[0].value} />
                                        </span>
                                    </div>
                            </div>
                            <div className="ui grid">
                                {this.state.loadJobs.length > 0 ? 
                                    <JobSummaryCard jobData={this.state.loadJobs}/> : 
                                    <p>No Jobs Found</p>
                                }
                            </div>
                            <div className="ui grid">
                                <div className="center aligned sixteen wide column">
                                    {this.state.loadJobs.length > 0 ?
                                        <Pagination
                                            boundaryRange={0}
                                            defaultActivePage={this.state.activePage}
                                            ellipsisItem={null}
                                            firstItem={null}
                                            lastItem={null}
                                            siblingRange={1}
                                            totalPages={this.state.totalPages}
                                            onPageChange={(event, data) => {
                                                this.setState({
                                                    activePage: data.activePage
                                                })
                                            }}
                                        /> :
                                        null
            }
                                </div>
                            </div>
                        </div>
                    </div>       
               </div>
            </BodyWrapper>
        )
    }
}