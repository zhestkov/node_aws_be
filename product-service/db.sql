create extension if not exists "uuid-ossp";

create table if not exists product (
	id uuid primary key default uuid_generate_v4(),
	title varchar(255) not null,
	description text,
	price integer
);

insert into product(title, description, price) values
('Sapiens: A Brief History of Humankind', 'Thrilling account of humankinds extraordinary history — from the Stone Age to the Silicon Age.', 24),
('Java 8 In Action', 'A clearly written guide to the new features of Java 8.', 49),
('Spring in Action, 5th Edition', 'This new edition includes all Spring 5.0 updates, along with new examples on reactive programming, Spring WebFlux, and microservices.', 69),
('Database Systems: The Complete Book', 'The ideal knowledge source for Database Systems and Database Design and Application courses offered at the junior, senior and graduate levels in Computer Science departments.', 88),
('Rich Dad Poor Dad', 'What the Rich Teach Their Kids About?', 32),
('Watching the English', 'The Hidden Rules of English Behaviour by social anthropologist Kate Fox', 19);

create index idx_product_title on product(title);

create table if not exists stock (
	id uuid primary key default uuid_generate_v4(),
	product_id uuid,
	count integer,
	foreign key(product_id) references product(id)
);

insert into stock (product_id, count) values
('6022961f-27a7-44de-ac46-6e0438a74b8a', 25),
('5bbd20b3-8f3c-4ad9-9905-a23aff66eaca', 10),
('dd9475db-7b61-4f99-a627-121e18b6d325', 7),
('23965a92-9ce3-433a-85ae-f5429f439838', 1),
('01815d96-2814-4b9f-8081-a9a6a5358efb', 50),
('05504c32-718e-4d36-b380-6078707131b5', 9);