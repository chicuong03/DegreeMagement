'use client'
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { mutate } from "swr";
interface IProps {
    showModalUpdate: boolean;
    setshowModalUpdate: (v: boolean) => void;
    blog: IBlog | null;
    setBlog: (value: IBlog | null) => void;
}
function UpdateModal(props: IProps) {
    const { showModalUpdate, setshowModalUpdate, blog, setBlog } = props;
    const [id, setId] = useState<number>(0);
    const [title, setTitle] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        if (blog && blog.id) {
            setId(blog.id);
            setTitle(blog.title);
            setAuthor(blog.author);
            setContent(blog.content);
        }
    }, [blog])

    const handSubmit = () => {

        if (!title) {
            toast.error("Title isEmpty!");
            return;
        }
        if (!author) {
            toast.error("Author isEmpty!");
            return;
        }
        if (!content) {
            toast.error("Content isEmpty!");
            return;
        }
        fetch(`http://localhost:8000/blogs/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author, content })
        }).then(res => res.json())
            .then(res => {
                if (res) {
                    toast.success("Update blog successed");
                    closeModal();
                    mutate("http://localhost:8000/blogs");
                }
            });

        // toast.info("Success done...");
        // console.log(">>>==== check: ", title, author, content);
    }

    const closeModal = () => {
        setTitle("");
        setAuthor("");
        setContent("");
        setBlog(null);
        setshowModalUpdate(false)
    }
    return (
        <>

            <Modal show={showModalUpdate} onHide={() => closeModal()} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Add new</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Titil</Form.Label>
                            <Form.Control type="email" placeholder="...."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Author</Form.Label>
                            <Form.Control type="email" placeholder="...."
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Content</Form.Label>
                            <Form.Control as="textarea" rows={3}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => closeModal()}>
                        Close
                    </Button>
                    <Button variant="warning" onClick={() => handSubmit()}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default UpdateModal;