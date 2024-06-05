import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Item } from 'semantic-ui-react';

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
                showClosed: true,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            limit: 6,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
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
        var link = 'https://talentservicestalentanderson.azurewebsites.net/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');

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
                        loaderData: loaderData,
                        totalPages: Math.ceil(res.totalCount / this.state.limit)
                    })
                    if (callback) callback();
                }.bind(this),
                error: function (res) {
                    console.error(res.status)
                }
        })
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

    handleFilterChange(event, data) {
        var value = data.value;

        var newFilter = TalentUtil.deepCopy(this.state.filter);

        Object.keys(newFilter).forEach(v => {
            newFilter[v] = value.includes(v);
        });
        
        this.loadNewData({ filter: newFilter, activePage: 1 });
    }

    handleSortChange(e, { value }) {
        this.loadNewData({ sortBy: { date: value }, activePage: 1 });
    };

    handlePageChange(e, { activePage }) {
        if (activePage != this.state.activePage) {
            this.loadNewData({ activePage: activePage });
        }
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
            { key: 'desc', text: 'Newest first', value: 'desc' },
            { key: 'asc', text: 'Oldest first', value: 'asc' }
        ]

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
               <div className ="ui container">
                    <div className="ui grid">
                        <div className="ui sixteen wide column">
                            <h3>List of Jobs</h3>
                            <div className="ui grid">
                                    <div className="ui six wide column">
                                        <span>
                                            <Icon name='filter' />
                                            Filter: {''}
                                            <Dropdown                                                 
                                                multiple
                                                placeholder="Choose filter" 
                                                selection 
                                                options={filterOptions} 
                                                defaultValue={Object.keys(this.state.filter).filter(k => this.state.filter[k])}
                                                onChange={this.handleFilterChange}
                                            />
                                        </span>
                                    </div>
                                    <div className="ui six wide column">
                                        <span>
                                            <Icon name='calendar alternate outline' />
                                                Sort by date: {' '}
                                            <Dropdown 
                                                inline 
                                                placeholder="Newest first" 
                                                selection 
                                                options={sortOptions} 
                                                defaultValue={this.state.sortBy.date} 
                                                onChange={this.handleSortChange}
                                            />
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
                                            boundaryRange={1}
                                            defaultActivePage={this.state.activePage}
                                            ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                            firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                                            lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                                            prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                            nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                            siblingRange={1}
                                            totalPages={this.state.totalPages}
                                            onPageChange={this.handlePageChange}
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