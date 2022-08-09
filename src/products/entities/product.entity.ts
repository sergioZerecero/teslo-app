import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";

@Entity()
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column('text',{
    unique: true
  })
  title: string;

  @Column('float', {
    default: 0
  })
  price: number;

  @Column({
    type: 'text',
    nullable: false
  })
  description: string;

  @Column('text',{
    unique: true
  })
  slug?: string;

  @Column('int',{
    default: 0
  })
  stock?: number;

  @Column('text',{
    array: true
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @BeforeInsert()
  checkSlugInsert(){
    this.slug = checkSlug(this.slug, this.title);
  }
  @BeforeUpdate()
  checkSlugUpdate(){
    this.slug = checkSlug(this.slug, this.title);
  }


}

function checkSlug(slug: string,title: string){
  
  console.log(slug);

  if(!slug){
    slug = title;
  }

  slug = slug
    .toLowerCase()
    .replaceAll(' ','_')
    .replaceAll('-','')
    .replaceAll("'","");

    return slug;

}
