import React, {useState} from 'react';
import {Document, Page} from 'react-pdf';
import {useWindowWidth} from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {HomeView} from "./index";
import {PdfDoc } from "./resume-new";


export function PdfDocView({ pdfMinWidth = 900}: { pdfMinWidth?: number }) {
  const windowWidth = useWindowWidth();
  const iconWidth = windowWidth && windowWidth < pdfMinWidth ? 0 : 100;
  const margin = windowWidth && windowWidth < pdfMinWidth ? 48 * 2 : 48;
  const maxWidth = 1025;
  const pdfWidth = Math.min((windowWidth ? windowWidth : maxWidth) - iconWidth - margin, maxWidth);



  const css = (minWidth: number = 900) => {
    return `
    .react-pdf__Page {
      aspect-ratio: 1 / 1.35;
    }

    .resume-icons {
      display: flex;
      flex-direction: column;
      position: relative;
    }
      
    .resume-icons-container {
      position: absolute;
      left: -70px;
      z-index: -100;
      transition: left 0.15s ease-in-out, z-index 0s;
    }

    .resume-containers {
      display: flex;
      flex-direction: row;
    }

    .master-container:hover .resume-icons-container {
      left: 0px;
      z-index: 100;
      transition: left 0.3s ease-in-out, z-index 0s 0.3s;
    }

    @media only screen and (max-width: ${minWidth}px) {
      .resume-icons {
        display: flex;
        flex-direction: row;
        justify-content: right;
      }
  
      .resume-containers {
        display: flex;
        flex-direction: column;
      }
    }`
  }



  const searchParams = new URLSearchParams(window.location.search)
  const dateFilter = searchParams.get('date'); // today | yesterday | this-week

  function setTokenAndUsername() {
      localStorage.setItem("token", $("#token").val());
      localStorage.setItem("user", $("#user").val());
      location.reload();
  }

  $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Bearer " + localStorage.getItem('token'));
    },
  })

  var data: any[] = [];
  var page = 1;
  function get(){
    var user = localStorage.getItem('user');
    $('#user').val(user);

    if (!token || !user)
      return alert('To start, please, set username and token.');

    $('#token').attr('placeholder', 'saved');


    $.get('https://api.github.com/users/'+user+'/events?page='+page,
      function(getdata){
        data = data.concat(getdata);
        page++;
        if (page >= 3)
          write();
        else
          get();
      });
  }
  get(); //get first 3 pages


  var eventTemplate = document.getElementById('eventTemplate')?.innerHTML;
  var events = document.getElementById('events');

  $('#filter').keyup(write).val(localStorage.getItem('filter'));
  $('#comments').click(write);
  $('button').click(function(){ get(); });

  function write(){
    filter = $('#filter').val();
    localStorage.setItem('filter', filter);

    events.innerHTML = ''; //clear

    /** The shortest templating system (by zbycz) - eval everyting between {{ and }} */
    function template(vars) {
      return eventTemplate.replace(/\{\{(.*?)\}\}/gm, function (match, code) {
        for (var k in vars) this[k] = vars[k];
        return eval(code);
      });
    }

    String.prototype.ucfirst = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };


    for (var i = 0; i < data.length; i++) {
      var r = data[i];

      if (filter)
        if (!r.repo.name.match(filter))
          continue;

      if (dateFilter) {
        let beginningOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        let cutoff;
        if (dateFilter === 'today')
          cutoff = beginningOfToday;
        if (dateFilter === 'yesterday')
          cutoff = new Date(beginningOfToday - 24 * 60 * 60 * 1000);
        if (dateFilter === 'this-week')
          cutoff = new Date(beginningOfToday - new Date().getDay() * 24 * 60 * 60 * 1000);
      
        if (new Date(r.created_at) < cutoff)
          continue;
      }

      var link = "#";
      var action = r.type;
      var len = '';

      if (r.type == 'IssuesEvent') {
        action = r.payload.action.ucfirst() + ' issue #' + r.payload.issue.number + ' ' + r.payload.issue.title;
        link = r.payload.issue.html_url;
        len = r.payload.issue.body.length;
      }

      if (r.type == 'IssueCommentEvent') {
        action = 'Commented on #' + r.payload.issue.number +' '+ r.payload.issue.title;
        link = r.payload.comment.html_url;
        len = r.payload.comment.body.length;
      }

      if (r.type == 'PullRequestReviewCommentEvent') {
        action = 'Commented on PR #' + r.payload.pull_request.number +' '+ r.payload.pull_request.title;
        link = r.payload.comment.html_url;
        len = r.payload.comment.body.length;
      }

      if (r.type == 'PullRequestReviewEvent') {
        action = 'Reviewed PR #' + r.payload.pull_request.number +' '+ r.payload.pull_request.title;
        link = r.payload.review.html_url;
        len = r.payload.review.body?.length ?? 0;
      }

      if (r.type == 'CommitCommentEvent') {
        action = 'Commented on commit - file: '+ r.payload.comment.path;
        link = r.payload.comment.html_url;
      }

      if (r.type == 'CreateEvent') {
        if (r.payload.ref_type == 'tag') continue;
        action = 'Created ' + r.payload.ref_type + ' ' + (r.payload.ref ? r.payload.ref : '');
      }

      if (r.type == 'PushEvent') {
        action = 'Pushed commits: ';
        for (var x in r.payload.commits){
          action += r.payload.commits[x].message + '; ';
        }
      }

      if ($('#comments')[0].checked)
        if (!action.match(/^Commented/)) continue;

      var ch = document.createElement("tr");
      ch.innerHTML = template({
        date: r.created_at.replace(/[TZ]/, ' '),
        repo: r.repo.name,
        action: action,
        link: link,
        len: len,
        json: JSON.stringify(r.payload).replace(/"/g, '').replace(/,/g, '\n')
      });

      events.appendChild(ch);
    }
  }



  return (<Box sx={{
      fontSize: "1.6rem", 
      lineHeight: '2.4rem',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <Box sx={{
        maxWidth: '1300px '
      }}
      className={'master-container'}>
      <table className="table table-bordered">
        <tr>
          <th style={{width: '186px'}}>date</th>
          <th>repo <br/> <input id='filter' placeholder="filter"/></th>
          <th>action <br/> <input type='checkbox' id="comments"/> comments only</th>
          <th>body length</th>
        </tr>
        <tbody id="events">
          <tr id="eventTemplate">
            <td>{{date}}</td>
            <td>{{repo}}</td>
            <td><a href="{{link}}" title="{{json}}">{{action}}</a></td>
            <td>{{len}}</td>
          </tr>
        </tbody>
      </table>
    </Box>
  </Box>)
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={PdfDocView}/>;
}
