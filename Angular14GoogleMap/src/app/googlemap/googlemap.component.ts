import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-googlemap',
  templateUrl: './googlemap.component.html',
  styleUrls: ['./googlemap.component.css']
})
export class GooglemapComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;

  display: any;
  center: google.maps.LatLngLiteral = { lat: 13, lng: 78 };
  zoom = 4;

  map!: google.maps.Map;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;

  distanceText: string = '';
  durationText: string = '';

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.loadGoogleMapsScript()
      .then(() => {
        this.initMap();
      })
      .catch((error) => {
        console.error('Error loading Google Maps script:', error);
      });
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null)
      this.center = event.latLng.toJSON();
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null)
      this.display = event.latLng.toJSON();
  }

  initMap(): void {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 17, lng: 77.2090 },
      zoom: 8
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
  }

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        // Script already loaded
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.apiKey}&libraries=visualization`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (error: any) => reject(error);
        document.head.appendChild(script);
      }
    });
  }
  

  getDistance(from: string, to: string): void {
    if (!from || !to) {
      alert("Please enter both 'from' and 'to' locations.");
      return;
    }

    if (!this.directionsService) {
      alert("Map not initialized yet.");
      return;
    }

    const request: google.maps.DirectionsRequest = {
      origin: from,
      destination: to,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        this.directionsRenderer.setDirections(result);

        const bounds = new google.maps.LatLngBounds();
        result.routes[0].legs.forEach((leg) => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        this.map.fitBounds(bounds);

        const leg = result.routes[0].legs[0];
        this.distanceText = "Distance: " + leg.distance?.text;
        this.durationText = "Duration: " + leg.duration?.text;
      } else {
        alert("Directions request failed due to " + status);
      }
    });
  }
}
