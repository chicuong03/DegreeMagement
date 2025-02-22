'use client'
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { mutate } from "swr";
interface IProp {
    showModalCreate: boolean;
    setshowModalCreate: (v: boolean) => void;
}
function CreateModal(props: IProp) {
    const { showModalCreate, setshowModalCreate } = props;

    const [title, setTitle] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [content, setContent] = useState<string>("");

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
        fetch('http://localhost:8000/blogs', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author, content })
        }).then(res => res.json())
            .then(res => {
                if (res) {
                    toast.success("Create new blog successed");
                    closeModal();
                    mutate("http://localhost:8000/blogs");
                }
            });

        // toast.info("Success done...");
        // console.log(">>> check: ", title, author, content);
    }

    const closeModal = () => {
        setTitle("");
        setAuthor("");
        setContent("");
        setshowModalCreate(false)
    }
    return (
        <>

            <Modal show={showModalCreate} onHide={() => closeModal()} backdrop="static" keyboard={false}>
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
                    <Button variant="primary" onClick={() => handSubmit()}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CreateModal;