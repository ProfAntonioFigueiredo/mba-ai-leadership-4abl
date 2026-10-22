import {createClient} from 'npm:@supabase/supabase-js@2';
import {createGradesHandler} from '../_shared/grades-handler.mjs';
Deno.serve(createGradesHandler({createClient,url:Deno.env.get('SUPABASE_URL'),key:Deno.env.get('SUPABASE_ANON_KEY'),allowedOrigin:Deno.env.get('ALLOWED_ORIGIN')}));
