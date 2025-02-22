'use client'
import Link from 'next/link';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import { mutate } from "swr";
import CreateModal from './create.model';
import UpdateModal from './update.modal';
interface IProps {
    blogs: IBlog[];
}
const AppTable = (props: IProps) => {
    const { blogs } = props;

    const [blog, setBlog] = useState<IBlog | null>(null);
    const [showModalCreate, setshowModalCreate] = useState<boolean>(false);
    const [showModalUpdate, setshowModalUpdate] = useState<boolean>(false);

    const handleDelete = (id: number) => {
        if (confirm(`ban co muon xoa blog id: ${id}`)) {
            fetch(`http://localhost:8000/blogs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
            }).then(res => res.json())
                .then(res => {
                    if (res) {
                        toast.success("Delete blog successed");
                        mutate("http://localhost:8000/blogs");
                    }
                });

        }
    }
    return (
        <>
            <div className='mb-3' style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Table Blog</h3>
                <Button variant="secondary"
                    onClick={() => setshowModalCreate(true)}
                >Add New</Button>

            </div>
            <Table bordered hover size='sm'>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {blogs?.map(item => {
                        return (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.title}</td>
                                <td>{item.author}</td>
                                <td>
                                    <Link className='btn btn-primary'
                                        href={`/blogs/${item.id}`}>
                                        View
                                    </Link>
                                    <Button variant='warning' className='mx-3' onClick={() => {
                                        setBlog(item);
                                        setshowModalUpdate(true);
                                    }}>Edit</Button>
                                    <Button variant='danger' onClick={() => handleDelete(item.id)}>Del</Button>
                                </td>
                            </tr>)
                    })}
                </tbody>
            </Table>
            <CreateModal
                showModalCreate={showModalCreate}
                setshowModalCreate={setshowModalCreate}
            />

            <UpdateModal
                showModalUpdate={showModalUpdate}
                setshowModalUpdate={setshowModalUpdate}
                blog={blog}
                setBlog={setBlog} />
        </>
    );
}
export default AppTable;
