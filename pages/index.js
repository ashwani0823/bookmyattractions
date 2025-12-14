import { supabase } from '../lib/supabaseClient';

export default function Home({ attractions }) {
  return (
    <main style={{ padding: 40 }}>
      <h1>Book My Attractions</h1>

      {attractions.length === 0 && <p>No attractions found</p>}

      {attractions.map((a) => (
        <div key={a.id} style={{ marginBottom: 20 }}>
          <h2>{a.name}</h2>
          <p>{a.city}, {a.state}</p>
          <p>₹{a.price}</p>
          <hr />
        </div>
      ))}
    </main>
  );
}

export async function getServerSideProps() {
  const { data, error } = await supabase
    .from('attractions')
    .select('*')
    .eq('is_active', true);

  return {
    props: {
      attractions: data || [],
    },
  };
}
