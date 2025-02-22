'use client'
import { useRouter } from 'next/navigation';
import { Button } from 'react-bootstrap';

const Cuong = () => {
    const router = useRouter()
    const handleBtn = () => {
        router.push("/")
        alert("me");
    }
    const msg = () => {
        router.push("/admin");
        alert("day la chisscuong ne");
    }
    return (
        <div>
            face book ne
            <div>

                <br />
                <button onClick={() => handleBtn()}>
                    back home
                </button>
            </div>
            <br />
            <div>
                <Button variant='success' onClick={() => msg()}>
                    chicuong
                </Button>
            </div>
        </div>

    )
}
export default Cuong;
