import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobBoardHttpService } from '../../../../services/job-board/job-board-http.service';
import { Experience } from '../../../../models/job-board/experience';
import { Paginator } from '../../../../models/setting/paginator';
import { HttpParams } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { BreadcrumbService } from '../../../../shared/services/breadcrumb.service';
import { MessageService } from '../../../../services/app/message.service';
import { DateValidators } from "../../../shared/validators/date.validators";

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})

export class ExperienceComponent implements OnInit {
  paginator: Paginator;
  experiences: Experience[];
  formExperience: FormGroup;
  experience: Experience;
  experienceDialog: boolean;
  flagExperiences: boolean;

  constructor(
    private spinnerService: NgxSpinnerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private jobBoardHttpService: JobBoardHttpService) {

    this.paginator = { current_page: '1', per_page: '5' };
    this.experiences = [];
  }

  ngOnInit(): void {
    this.getExperiences(this.paginator);
    this.buildFormExperience();
  }

  // Build form experience
  buildFormExperience() {
    this.formExperience = this.formBuilder.group({
      id: [null],
      address: [null, Validators.required],
      location: [null, Validators.required],
      start_date: [null, Validators.required, DateValidators.valid],
      end_date: [null, Validators.required, DateValidators.valid],
      type: [null, Validators.required],
      description: [null, [Validators.required, Validators.minLength(10)]],
    });
  }

  // experiences of backend
  getExperiences(paginator: Paginator) {
    const params = new HttpParams()
      .append('page', paginator.current_page)
      .append('per_page', paginator.per_page);

    this.flagExperiences = true;
    // this.spinnerService.show();
    this.jobBoardHttpService.get('experiences', params).subscribe(
      response => {
        // this.spinnerService.hide();
        this.flagExperiences = false;
        this.experiences = response['data'];
        this.paginator = response as Paginator;
      }, error => {
        // this.spinnerService.hide();
        this.flagExperiences = false;
        this.messageService.error(error);
      });
  }
}