import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Landing Page';

  constructor() {
    console.log('AppComponent constructor called');
  }

  ngOnInit(): void {
    console.log('AppComponent ngOnInit called');
  }

  onMobileFilterToggle(): void {
    // This will be handled by the product list component
    console.log('Mobile filter toggle from navbar');
  }
}
