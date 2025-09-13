import { useAuth } from "react-oidc-context"

export default function Profile() {
    const auth = useAuth()

    return (
        <div>
            <h2>Profile</h2>
            <pre>Email: {auth.user?.profile.email}</pre>
            <details>
                <summary>Tokens</summary>
                <pre>ID: {auth.user?.id_token}</pre>
                <pre>Access: {auth.user?.access_token}</pre>
                <pre>Refresh: {auth.user?.refresh_token}</pre>
            </details>
            <button onClick={() => auth.removeUser()}>Sign out</button>
        </div>
    )
}