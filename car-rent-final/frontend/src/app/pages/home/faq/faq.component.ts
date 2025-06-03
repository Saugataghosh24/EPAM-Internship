import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FAQStory } from '../../../models/FAQStory.model';
import { FaqService } from '../../../services/faq.service';


@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  animations: [
    trigger('slideToggle', [
      state('closed', style({
        height: '0px',
        opacity: 0,
        paddingTop: '0',
        paddingBottom: '0',
      })),
      state('open', style({
        height: '*',
        opacity: 1,
        paddingTop: '*',
        paddingBottom: '*',
      })),
      transition('closed <=> open', animate('300ms ease')),
    ]),
  ]
})
export class FaqComponent implements OnInit{

  faqs:FAQStory[]=[];
  openIndex: number | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private faqService: FaqService) {}


  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.isLoading = true;
    this.error = null;
    
    this.faqService.getFAQStory().subscribe({
      next: (data) => {
        this.faqs = data.content;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching FAQ data:', err);
        this.error = 'Failed to load FAQ data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  toggle(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }

  isOpen(index: number): boolean {
    return this.openIndex === index;
  }
}
