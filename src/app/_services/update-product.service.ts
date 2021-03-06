import { Injectable, PipeTransform, OnDestroy, OnInit } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { SortColumn, SortDirection } from '../directives/sortable.directives';
import { BehaviorSubject, Subject, Observable, of, Subscription} from 'rxjs';

import { tap, debounceTime, switchMap, delay} from 'rxjs/operators';
import { ProductServiceOperation } from './product.services';



export interface ProductInfo {
    productId: number;
    id: number;
    productName: string;
    description: string;
    price: number;
    category: string;
    availableProduct: number;
    isPublished: string;
    imageFile: {
        fileName:string;
        data:string;
        mimetype: string;
    },
    post: {
        featuredProduct: string | boolean,
        topProduct: string| boolean,
        latestProduct: string| boolean,
        supermarketProduct: string| boolean,
        restaurantProduct: string| boolean,
        other: string| boolean
    },
    options:{
        restaurantFood: string | boolean,
        restaurantDrink: string | boolean,
        restaurantDessert: string | boolean,
        supermarketGrocery: string | boolean,
        supermarketVegetable: string | boolean,
        supermarketCannedGoods: string | boolean
      }

}


interface SearchResult {
    products: ProductInfo[];
    total: number;
}


interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
}



const compare = ( v1: string |number, v2: string | number) => (
    v1 < v2 ? -1 : v1 > v2 ? 1 : 0 )

export function sort(products: ProductInfo[], column: SortColumn, direction: string){
    if (direction === '' || column === '') {
        return products;
    } else {
        return [...products].sort((a,b) => {
            const res = compare(a[column], b[column]);
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches (product: ProductInfo, term: string, pipe: PipeTransform){
    return product.productName.toLowerCase().includes(term.toLowerCase())
    || product.description.toLowerCase().includes(term.toLowerCase())
    || product.category.toLowerCase().includes(term.toLowerCase())
    || product.isPublished.toString().toLowerCase().includes(term.toLowerCase())
    || product.post.featuredProduct.toString().toLowerCase().includes(term.toLowerCase())
    || product.post.topProduct.toString().toLowerCase().includes(term.toLowerCase())
    || product.post.latestProduct.toString().toLowerCase().includes(term.toLowerCase())
    || product.post.supermarketProduct.toString().toLowerCase().includes(term.toLowerCase())
    || product.post.restaurantProduct.toString().toLowerCase().includes(term.toLowerCase())
    || product.post.other.toString().toLowerCase().includes(term.toLowerCase())

    || product.options.supermarketGrocery.toString().toLowerCase().includes(term.toLowerCase())
    || product.options.supermarketCannedGoods.toString().toLowerCase().includes(term.toLowerCase())
    || product.options.supermarketVegetable.toString().toLowerCase().includes(term.toLowerCase())
    || product.options.restaurantDessert.toString().toLowerCase().includes(term.toLowerCase())
    || product.options.restaurantDrink.toString().toLowerCase().includes(term.toLowerCase())
    || product.options.restaurantFood.toString().toLowerCase().includes(term.toLowerCase())
    || pipe.transform(product.price).includes(term)
    || pipe.transform(product.productId).includes(term)
    || pipe.transform(product.availableProduct).includes(term)
}



@Injectable({providedIn: 'any'})
export class ProductService implements OnDestroy, OnInit {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _search$ = new Subject<void>();
    private _products$ = new BehaviorSubject<ProductInfo[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    dataCollector: any[];
    private _subscriber$ : Subscription;
    private _subscriber2$ : Subscription;

    private _state : State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe,
                private productService: ProductServiceOperation ) {
        this.dataCollector = [];
        this.ngOnInit();
    }

    ngOnInit(): void {
        this._subscriber$ = this.productService.getAll().subscribe( data => { 
            this.dataCollector = data;
            this.initializeOpSearch();
              }, err => {
            console.log("Error : "+err);
                });
    }

    
    
    ngOnDestroy(): void {
        if (this._subscriber$){
            this._subscriber$.unsubscribe();
        } if ( this._subscriber2$){
            this._subscriber2$.unsubscribe();
        }   
    }

    initializeOpSearch(){
        this._subscriber2$ = this._search$.pipe(
            tap(()=> this._loading$.next(true)),
            debounceTime(200),
            switchMap(()=> this._search()),
            delay(200),
            tap(()=> this._loading$.next(false)))
            .subscribe( result => {
                this._products$.next(result.products);
                this._total$.next(result.total);
            } );
        this._search$.next();
    }

    get products$() {return this._products$.asObservable();}

    get total$() { return this._total$.asObservable();}

    get loading$() { return this._loading$.asObservable();}

    get page() {return this._state.page; }

    get pageSize() { return this._state.pageSize; }

    get searchTerm() {
        return this._state.searchTerm; }

    set page(page: number) { this._set({page});}

    set pageSize(pageSize: number) { this._set({pageSize});}

    set searchTerm(searchTerm: string) { this._set({searchTerm});}

    set sortColumn(sortColumn: SortColumn) {this._set({sortColumn});}

    set sortDirection(sortDirection: SortDirection) { this._set({sortDirection});}

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        this._search$.next();
    }

    private _search(): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

        let products = sort( this.dataCollector , sortColumn, sortDirection);

        products = products.filter( product => matches(product, searchTerm, this.pipe));


        const total = products.length;

        //paginate
        products = products.slice((page-1)*pageSize, (page - 1)* pageSize+pageSize);
        return of({products, total});
    }

    // notEmptyData(data) {
    //     if (data.length > 0){
    //         return data;
    //     }
    // }

}
