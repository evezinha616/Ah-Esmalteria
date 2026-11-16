import React,{useEffect,useState} from 'react';
import {View,SafeAreaView,ScrollView,Text,TextInput,TouchableOpacity,StyleSheet} from 'react-native';
import {supabase,configured,message} from './online';
export default function OnlineGate({children}){
const [showPassword,setShowPassword]=useState(false);
const [session,S]=useState(null),[loaded,L]=useState(false),[email,E]=useState(''),[password,P]=useState(''),[notice,N]=useState(''),[busy,B]=useState(false);
useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data,error})=>{if(error)N(message(error));S(data?.session||null);L(true)}).catch(e=>{N(message(e));L(true)});const {data}=supabase.auth.onAuthStateChange((event,s)=>{S(s);L(true)});return()=>data.subscription.unsubscribe()},[]);
async function auth(signup){if(busy)return;if(!email.trim()||password.length<8){N('Informe seu e-mail e uma senha com pelo menos 8 caracteres.');return}B(true);N('');try{const result=signup?await supabase.auth.signUp({email:email.trim(),password}):await supabase.auth.signInWithPassword({email:email.trim(),password});if(result.error)throw result.error;if(signup&&!result.data.session)N('Confira seu e-mail e confirme o cadastro. Depois volte e entre.');P('');setShowPassword(false)}catch(e){N(message(e))}finally{B(false)}}
if(configured&&loaded&&session)return children(session);
return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps='handled'><Text style={s.brand}>AH ESMALTERIA!</Text><Text style={s.title}>{configured?'Seu cuidado começa aqui.':'Agenda online em preparação'}</Text><Text style={s.body}>{configured?'Entre para reservar seu horário e acompanhar seus agendamentos.':'A conexão com o salão ainda precisa ser configurada. Veja o arquivo COMEÇAR-AQUI.md que acompanha o projeto.'}</Text>{configured&&loaded&&<><TextInput style={s.input} accessibilityLabel='E-mail' placeholder='Seu e-mail' keyboardType='email-address' autoCapitalize='none' autoCorrect={false} value={email} onChangeText={E}/><View style={s.passwordRow}>
  <TextInput
    style={s.passwordInput}
    accessibilityLabel='Senha'
    placeholder='Senha (mínimo 8 caracteres)'
    placeholderTextColor='#806c83'
    secureTextEntry={!showPassword}
    autoCapitalize='none'
    autoCorrect={false}
    value={password}
    onChangeText={P}
  />
  <TouchableOpacity
    style={s.visibilityButton}
    accessibilityRole='button'
    accessibilityLabel={showPassword?'Ocultar senha':'Mostrar senha'}
    onPress={()=>setShowPassword(visible=>!visible)}
  >
    <View style={s.eye} pointerEvents='none'>
      <View style={s.pupil}/>
      {!showPassword&&<View style={s.slash}/>}
    </View>
  </TouchableOpacity>
</View><TouchableOpacity style={s.button} disabled={busy} onPress={()=>auth(false)}><Text style={s.white}>{busy?'Aguarde…':'Entrar'}</Text></TouchableOpacity><TouchableOpacity style={s.secondary} disabled={busy} onPress={()=>auth(true)}><Text style={s.brand}>Criar minha conta</Text></TouchableOpacity><Text style={s.body}>A manicure entra com sua própria conta. O acesso à agenda completa é liberado pela responsável pelo projeto.</Text></>}{configured&&!loaded&&<Text>Carregando…</Text>}{!!notice&&<Text accessibilityRole='alert' style={s.notice}>{notice}</Text>}</ScrollView></SafeAreaView>}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#fff8fc'},page:{padding:28,paddingTop:70,maxWidth:600,width:'100%',alignSelf:'center'},brand:{color:'#57156c',fontWeight:'800',fontSize:18},title:{fontSize:32,fontWeight:'800',color:'#57156c',marginVertical:24},body:{color:'#806c83',lineHeight:23,marginBottom:20},input:{backgroundColor:'white',borderWidth:1,borderColor:'#eadcea',padding:17,borderRadius:16,marginVertical:8},passwordRow:{flexDirection:'row',alignItems:'center',backgroundColor:'white',borderWidth:1,borderColor:'#eadcea',borderRadius:16,marginVertical:8},
passwordInput:{flex:1,minWidth:0,padding:17,color:'#000',fontSize:16},
visibilityButton:{width:48,minHeight:48,justifyContent:'center',alignItems:'center'},
eye:{width:23,height:14,borderWidth:2,borderColor:'#57156c',borderRadius:12,alignItems:'center',justifyContent:'center'},
pupil:{width:6,height:6,borderRadius:3,backgroundColor:'#57156c'},
slash:{position:'absolute',width:25,height:2,backgroundColor:'#57156c',transform:[{rotate:'-40deg'}]},
button:{padding:18,backgroundColor:'#dc208d',borderRadius:16,alignItems:'center',marginTop:15},white:{color:'white',fontWeight:'800'},secondary:{padding:18,alignItems:'center'},notice:{color:'#b21b56',lineHeight:23,marginTop:15}});

